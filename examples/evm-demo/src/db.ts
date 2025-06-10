import { createClient, getAll } from '@vercel/edge-config'

const config = createClient(process.env.EDGE_CONFIG)

export interface CardDetails {
  serialNumber: string
  campaign: string
  deviceId: string
  pushToken: string
  passTypeId: string
  createdAt: string
  updatedAt: string
}

// Test Edge Config connection
export async function testEdgeConfigConnection(): Promise<boolean> {
  try {
    const testKey = 'test'
    // Write using Vercel REST API
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ key: testKey, value: 'connection' }],
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to set test value')
    }

    // Read using Edge Config client
    const result = await config.get(testKey)

    // Delete using Vercel REST API
    await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ key: testKey, value: null }],
        }),
      }
    )

    return result === 'connection'
  } catch (error) {
    console.error('Edge Config connection test failed:', error)
    return false
  }
}

export async function storeCampaign(
  serialNumber: string,
  campaign: string
): Promise<void> {
  const key = `card_${serialNumber}`
  const existing = await config.get(key)

  console.log('Existing record (Campaign):', existing)

  const data = {
    serialNumber,
    campaign,
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString(),
  }

  console.log('Data (Campaign):', data)

  // Log token info (without exposing the full token)
  console.log('Token info:', {
    hasToken: !!process.env.VERCEL_API_TOKEN,
    tokenLength: process.env.VERCEL_API_TOKEN?.length,
    tokenPrefix: process.env.VERCEL_API_TOKEN?.slice(0, 4),
  })

  const response = await fetch(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?teamId=team_ryJ4XZuu7YrC0TunT5S2QwiZ`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            key,
            value: data,
            operation: 'create', // Always use create for campaign data
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Failed to store campaign data:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      key,
      data,
    })
    throw new Error(
      `Failed to store campaign data: ${response.status} ${response.statusText}`
    )
  }

  // Wait for eventual consistency with retries
  let retries = 3
  let existing2 = null
  while (retries > 0) {
    // Wait 1 second before checking
    await new Promise(resolve => setTimeout(resolve, 1000))
    existing2 = await config.get(key)
    console.log(`Existing record (Campaign) attempt ${4-retries}:`, existing2)
    
    if (existing2 !== undefined) {
      break
    }
    retries--
  }

  if (!existing2) {
    console.warn('Warning: Could not verify write after retries')
  }
}

export async function storeRegistration(
  serialNumber: string,
  deviceId: string,
  pushToken: string,
  passTypeId: string
): Promise<void> {
  const key = `card_${serialNumber}`
  
  // First check if the record exists
  const existing = await config.get(key)
  console.log('Existing record (Registration):', existing)

  if (!existing) {
    throw new Error('Cannot update registration: Campaign record not found')
  }

  const data = {
    ...existing,
    serialNumber,
    deviceId,
    pushToken,
    passTypeId,
    updatedAt: new Date().toISOString(),
    createdAt: existing.createdAt, // Use existing createdAt
  }

  // Always use update operation since we know the record exists
  const response = await fetch(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?teamId=team_ryJ4XZuu7YrC0TunT5S2QwiZ`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            key,
            value: data,
            operation: 'update', // Always use update since we know it exists
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Failed to store registration data:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      key,
      data,
      existing,
    })
    throw new Error(
      `Failed to store registration data: ${response.status} ${response.statusText}`
    )
  }
}

export async function getCardDetails(
  serialNumber: string
): Promise<CardDetails | null> {
  console.log('Searching for serial number:', serialNumber)
  const key = `card_${serialNumber}`

  try {
    const result = await config.get(key)
    console.log('Query result:', result)

    if (!result || result === undefined) {
      // List all cards for debugging
      const allItems = await getAll()
      console.log('All items:', allItems)
      console.log('All items type:', typeof allItems)
      console.log('All items keys:', Object.keys(allItems))
      console.log('All items values:', Object.values(allItems))
      return null
    }

    return result as CardDetails
  } catch (error) {
    console.error('Error fetching card:', error)
    return null
  }
}

export async function deleteCardDetails(
  serialNumber: string
): Promise<boolean> {
  const key = `card_${serialNumber}`
  const response = await fetch(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?teamId=team_ryJ4XZuu7YrC0TunT5S2QwiZ`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            key,
            value: null,
            operation: 'delete',
          },
        ],
      }),
    }
  )

  // delete success not critical, continue on error
  if (!response.ok) {
    const errorBody = await response.text()
    console.log('Failed to delete card details:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      key,
    })
  }

  return response.ok
}
