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
    await config.set('test', 'connection')
    const result = await config.get('test')
    await config.delete('test')
    return result === 'connection'
  } catch (error) {
    console.error('Edge Config connection test failed:', error)
    return false
  }
}

export async function storeCampaign(serialNumber: string, campaign: string): Promise<void> {
  const key = `card:${serialNumber}`
  const existing = await config.get<CardDetails>(key)
  
  const data = {
    ...existing,
    serialNumber,
    campaign,
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString()
  }

  await config.set(key, data)
}

export async function storeRegistration(
  serialNumber: string,
  deviceId: string,
  pushToken: string,
  passTypeId: string
): Promise<void> {
  const key = `card:${serialNumber}`
  const existing = await config.get<CardDetails>(key)
  
  const data = {
    ...existing,
    serialNumber,
    deviceId,
    pushToken,
    passTypeId,
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString()
  }

  await config.set(key, data)
}

export async function getCardDetails(serialNumber: string): Promise<CardDetails | null> {
  console.log('Searching for serial number:', serialNumber)
  const key = `card:${serialNumber}`
  
  try {
    const result = await config.get<CardDetails>(key)
    console.log('Query result:', result)
    
    if (!result) {
      // List all cards for debugging
      const allKeys = await config.list()
      console.log('All keys:', allKeys)
      return null
    }

    return result
  } catch (error) {
    console.error('Error fetching card:', error)
    return null
  }
}
