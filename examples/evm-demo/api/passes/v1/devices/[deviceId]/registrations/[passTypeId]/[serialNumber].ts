import { VercelRequest, VercelResponse } from '@vercel/node'
import { storeRegistration } from '../../../../../../../src/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the request method and path for debugging
  console.log('Request method:', req.method)
  console.log('Request path:', req.url)

  const { deviceId, passTypeId, serialNumber } = req.query

  // Validate required parameters
  if (!deviceId || !passTypeId || !serialNumber) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  // Handle registration
  if (req.method === 'POST') {
    const { pushToken } = req.body

    // Validate push token
    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' })
    }

    try {
      // Store the registration in the database
      storeRegistration(
        serialNumber as string,
        deviceId as string,
        pushToken,
        passTypeId as string
      )

      console.log('Registration stored:', {
        deviceId,
        passTypeId,
        serialNumber,
        pushToken,
      })

      // Return 201 Created as per Apple's specification
      return res.status(201).json({})
    } catch (error) {
      console.error('Error storing registration:', error)
      return res.status(500).json({ error: 'Failed to store registration' })
    }
  }

  // Return 405 for non-POST methods
  return res.status(405).json({ error: 'Method not allowed' })
}

/*
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

  res.status(405).json({ error: 'Method not allowed Test1' })
}

*/
