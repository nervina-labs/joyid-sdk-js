import { createClient } from '@vercel/edge-config'

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
    // Write using REST API
    const response = await fetch(`${process.env.EDGE_CONFIG}/items`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ key: testKey, value: 'connection' }],
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to set test value')
    }

    // Read using Edge Config client
    const result = await config.get(testKey)

    // Delete using REST API
    await fetch(`${process.env.EDGE_CONFIG}/items`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ key: testKey, value: null }],
      }),
    })

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
  const key = `card:${serialNumber}`
  const existing = await config.get(key)

  const data = {
    ...existing,
    serialNumber,
    campaign,
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString(),
  }

  const response = await fetch(`${process.env.EDGE_CONFIG}/items`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ key, value: data }],
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to store campaign data')
  }
}

export async function storeRegistration(
  serialNumber: string,
  deviceId: string,
  pushToken: string,
  passTypeId: string
): Promise<void> {
  const key = `card:${serialNumber}`
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

  const response = await fetch(`${process.env.EDGE_CONFIG}/items`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ key, value: data }],
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to store registration data')
  }
}

export async function getCardDetails(
  serialNumber: string
): Promise<CardDetails | null> {
  console.log('Searching for serial number:', serialNumber)
  const key = `card:${serialNumber}`

  try {
    const result = await config.get(key)
    console.log('Query result:', result)

    if (!result || result === undefined) {
      // List all cards for debugging
      const allKeys = await config.list()
      console.log('All keys:', allKeys)
      return null
    }

    return result as CardDetails
  } catch (error) {
    console.error('Error fetching card:', error)
    return null
  }
}
