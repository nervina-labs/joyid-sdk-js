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

  const data = {
    ...existing,
    serialNumber,
    campaign,
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString(),
  }

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
            operation: existing ? 'update' : 'create',
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
}

export async function storeRegistration(
  serialNumber: string,
  deviceId: string,
  pushToken: string,
  passTypeId: string
): Promise<void> {
  const key = `card_${serialNumber}`
  const existing = await config.get(key)

  const data = {
    ...existing,
    serialNumber,
    deviceId,
    pushToken,
    passTypeId,
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString(),
  }

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
            operation: existing ? 'update' : 'create',
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
