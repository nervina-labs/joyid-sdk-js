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
    await config.setAll({ [testKey]: 'connection' })
    const result = await config.get(testKey)
    await config.setAll({ [testKey]: null })
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

  await config.setAll({ [key]: data })
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

  await config.setAll({ [key]: data })
}

export async function getCardDetails(
  serialNumber: string
): Promise<CardDetails | null> {
  console.log('Searching for serial number:', serialNumber)
  const key = `card:${serialNumber}`

  try {
    const result = await config.get(key)
    console.log('Query result:', result)

    if (!result) {
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
