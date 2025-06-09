// /api/passes/v1/devices/[...params].ts
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { params } = req.query // params is an array of the path segments after /devices/

  // Example: /api/passes/v1/devices/ABC123DEF456/registrations/pass.com.stl-example.coffee-loyalty-1/1234567890
  // params = ['ABC123DEF456', 'registrations', 'pass.com.stl-example.coffee-loyalty-1', '1234567890']

  if (!params || params.length < 4) {
    return res.status(400).json({ error: 'Invalid request path' })
  }

  const deviceLibraryIdentifier = params[0]
  const action = params[1] // should be 'registrations'
  const passTypeIdentifier = params[2]
  const serialNumber = params[3]

  console.log('deviceLibraryIdentifier', deviceLibraryIdentifier)
  console.log('action', action)
  console.log('passTypeIdentifier', passTypeIdentifier)
  console.log('serialNumber', serialNumber)

  // You can now handle registration logic here
  if (req.method === 'POST' && action === 'registrations') {
    // Example: store deviceLibraryIdentifier, passTypeIdentifier, serialNumber, and pushToken from req.body
    const { pushToken } = req.body
    // Store these in your database as needed

    return res
      .status(201)
      .json({ message: 'Device registered for push updates' })
  }

  // Handle other methods/actions as needed

  res.status(405).json({ error: 'Method not allowed' })
}
