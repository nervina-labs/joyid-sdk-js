import { VercelRequest, VercelResponse } from '@vercel/node'
import {
  getCardDetails,
  storeRegistration,
  deleteCardDetails,
} from '../../../../../../../src/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the request method and path for debugging
  console.log('Request method:', req.method)
  console.log('Request path:', req.url)

  const { deviceId, passTypeId, serialNumber } = req.query

  // Validate required parameters
  if (!deviceId || !passTypeId || !serialNumber) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  // Handle GET request for pass file
  if (req.method === 'GET') {
    try {
      // Get card details to verify it exists
      const cardDetails = await getCardDetails(serialNumber as string)
      if (!cardDetails) {
        console.log('Pass not found:', { passTypeId, serialNumber })
        return res.status(404).json({ error: 'Pass not found' })
      }

      // TODO: Generate and serve the .pkpass file
      // For now, return a placeholder response
      console.log('Pass found, would serve .pkpass file:', {
        passTypeId,
        serialNumber,
        cardDetails: {
          ...cardDetails,
          pushToken: cardDetails.pushToken ? cardDetails.pushToken.slice(0, 10) + '...' : undefined
        }
      })

      // Return 501 Not Implemented until we implement .pkpass generation
      return res.status(501).json({ error: 'Pass generation not yet implemented' })
    } catch (error) {
      console.error('Error serving pass:', error)
      return res.status(500).json({ error: 'Failed to serve pass' })
    }
  }

  // Handle registration
  if (req.method === 'POST') {
    const { pushToken } = req.body

    // Validate push token
    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' })
    }

    try {
      await storeRegistration(
        serialNumber as string,
        deviceId as string,
        pushToken,
        passTypeId as string
      )
      console.log('Registration stored successfully:', {
        deviceId,
        passTypeId,
        serialNumber,
        pushToken,
      })

      // Return 201 Created as per Apple's specification
      return res.status(201).json({})
    } catch (error: any) {
      console.error('Error storing registration:', error)
      // Return 500 to Apple - they will retry
      return res.status(500).json({ error: 'Failed to store registration' })
    }
  }

  // Handle unregistration (when user removes pass from wallet)
  if (req.method === 'DELETE') {
    try {
      // Get current card details
      const cardDetails = await getCardDetails(serialNumber as string)
      console.log('Card details for deletion:', cardDetails)

      if (!cardDetails) {
        return res.status(404).json({ error: 'Pass not found' })
      }

      //can we simply delete the card details from the db?
      const deleteResult = await deleteCardDetails(serialNumber as string)
      console.log('Delete result:', deleteResult)

      // Return 200 OK as per Apple's specification
      return res.status(200).json({})
    } catch (error) {
      console.error('Error removing registration:', error)
      return res.status(500).json({ error: 'Failed to remove registration' })
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
