import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { deviceId, passTypeId, serialNumber } = req.query

  console.log('deviceId', deviceId)
  console.log('passTypeId', passTypeId)
  console.log('serialNumber', serialNumber)

  // Handle registration logic here
  if (req.method === 'POST') {
    // Example: store deviceId, passTypeId, serialNumber, and pushToken from req.body
    const { pushToken } = req.body
    // Store these in your database as needed

    console.log('pushToken', pushToken)

    return res
      .status(201)
      .json({ message: 'Device registered for push updates' })
  }

  // Handle other methods as needed
  res.status(405).json({ error: 'Method not allowed Test2' })
} 