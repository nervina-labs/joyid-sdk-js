import { createClient, getAll } from '@vercel/edge-config'

const config = createClient(process.env.EDGE_CONFIG)

// Simple cache for recent registrations
const registrationCache = new Map<
  string,
  { pushToken: string; campaign: string; passTypeId: string; timestamp: number }
>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export interface CardCache {
  passId: string
  fileURL: string
  timestamp: number
  platform: string
}

const cardCache = new Map<string, CardCache>()

// Clean up old cache entries
function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of registrationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      registrationCache.delete(key)
    }
  }

  for (const [key, value] of cardCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cardCache.delete(key)
    }
  }
}

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
  const existing = (await config.get(key)) as { createdAt?: string } | undefined

  //first, store the campaign in the cache
  registrationCache.set(serialNumber, {
    campaign,
    pushToken: '',
    passTypeId: '',
    timestamp: Date.now(),
  })

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

  if (response.ok) {
    console.log('Campaign data stored successfully', response.status)
  } else {
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

//storePass(id, result.id, result.platform, result.fileURL);

export async function storePass(
  id: string,
  passId: string,
  platform: string,
  fileURL: string
): Promise<void> {
  const key = `card_${id}`
  const existing = (await config.get(key)) as { createdAt?: string } | undefined

  //first, store the campaign in the cache
  cardCache.set(id, {
    passId,
    fileURL,
    timestamp: Date.now(),
    platform,
  })

  console.log('Existing record (Campaign):', existing)

  const data = {
    passId,
    platform,
    fileURL,
    createdAt: existing?.createdAt || new Date().toISOString(),
  }

  console.log('Data (Card):', data)

  let operation = 'create'

  if (existing) {
    if (data.passId && data.platform && data.fileURL) {
      console.log('Updating card data')
      operation = 'update'
    } else {
      return
    }
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
            operation: operation,
          },
        ],
      }),
    }
  )

  if (response.ok) {
    console.log('Card data stored successfully', response.status)
  } else {
    const errorBody = await response.text()
    console.error('Failed to store card data:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      key,
      data,
    })
    throw new Error(
      `Failed to store card data: ${response.status} ${response.statusText}`
    )
  }
}

export async function getPass(id: string): Promise<CardCache | null> {
  console.log('Searching for card:', id)
  const key = `card_${id}`

  try {
    cleanupCache() // Clean up old entries

    const result = (await config.get(key)) as CardCache | null

    if (result == null) {
      // use cached data if available
      const cached = cardCache.get(id)
      if (cached) {
        console.log('Found cached card:', cached)
        return cached
      }

      return null
    }

    // remove from cache, don't care if it doesn't exist
    cardCache.delete(id)

    return result
  } catch (error) {
    console.error('Error fetching card:', error)
    return null
  }
}

export async function storeRegistration(
  serialNumber: string,
  deviceId: string,
  pushToken: string,
  passTypeId: string
): Promise<void> {
  const key = `card_${serialNumber}`
  const record = (await config.get(key)) as CardDetails | null
  const now = new Date().toISOString()

  //first fetch the campaign from the cache
  const campaign = registrationCache.get(serialNumber)?.campaign

  //now, update cache with push token
  registrationCache.set(serialNumber, {
    campaign: campaign || '',
    pushToken,
    passTypeId,
    timestamp: Date.now(),
  })

  // First check if the record exists
  const existing = record
  console.log('Existing record (Registration):', existing)

  let data = existing
  if (data == null) {
    // Wait 5 seconds and try one more time
    console.log('Campaign record not found, waiting 5 seconds before retry...')
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const retryExisting = (await config.get(key)) as CardDetails | null
    if (retryExisting == null) {
      throw new Error(
        'Cannot update registration: Campaign record not found, allow retry later'
      )
    }
    data = retryExisting
  }

  const updatedData = {
    ...data,
    serialNumber,
    deviceId,
    pushToken,
    passTypeId,
    updatedAt: now,
    createdAt: data.createdAt, // Use existing createdAt
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
            value: updatedData,
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
      data: updatedData,
      existing: record,
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
    cleanupCache() // Clean up old entries

    const result = (await config.get(key)) as CardDetails | null
    console.log('Query result:', result)

    if (result == null) {
      // List all cards for debugging
      const allItems = await getAll()
      console.log('All items:', allItems)
      console.log('All items type:', typeof allItems)
      console.log('All items keys:', Object.keys(allItems))
      console.log('All items values:', Object.values(allItems))

      // use cached data if available
      const cached = registrationCache.get(serialNumber)
      if (cached) {
        console.log('Found in cache:', cached)
        return {
          serialNumber,
          campaign: cached.campaign,
          deviceId: '',
          pushToken: cached.pushToken,
          passTypeId: cached.passTypeId,
          createdAt: new Date(cached.timestamp).toISOString(),
          updatedAt: new Date(cached.timestamp).toISOString(),
        }
      }

      return null
    }

    // remove from cache, don't care if it doesn't exist
    registrationCache.delete(serialNumber)

    return result
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

  // Remove from cache if it exists
  registrationCache.delete(serialNumber)

  return response.ok
}

export async function storeMerchantApiKey(
  username: string,
  apiKey: string
): Promise<void> {
  const key = `merchant_${username}`
  const existing = (await config.get(key)) as { createdAt?: string } | undefined

  const data = {
    apiKey,
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

  if (response.ok) {
    console.log('Merchant API key stored successfully')
  } else {
    const errorBody = await response.text()
    console.error('Failed to store merchant API key:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    })
    throw new Error('Failed to store merchant API key')
  }
}
