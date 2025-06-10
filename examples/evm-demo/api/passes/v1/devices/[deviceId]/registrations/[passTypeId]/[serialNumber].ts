import { VercelRequest, VercelResponse } from '@vercel/node'
import {
  getCardDetails,
  storeRegistration,
  deleteCardDetails,
} from '../../../../../../../src/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { deviceId, passTypeId, serialNumber } = req.query

  // Log everything about the request
  console.log('Pass Registration Request:', {
    method: req.method,
    path: req.url,
    query: req.query,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
  })

  // Validate required parameters
  if (!deviceId || !passTypeId || !serialNumber) {
    console.error('Missing required parameters:', {
      deviceId,
      passTypeId,
      serialNumber,
    })
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Serve the pass file
        const cardDetails = await getCardDetails(serialNumber as string)
        if (!cardDetails) {
          console.error('Pass not found:', { serialNumber })
          return res.status(404).json({ error: 'Pass not found' })
        }

        console.log('Found pass:', {
          serialNumber,
          cardDetails: {
            ...cardDetails,
            pushToken: cardDetails.pushToken
              ? cardDetails.pushToken.slice(0, 10) + '...'
              : undefined,
          },
        })

        // Return 501 Not Implemented until we implement .pkpass generation
        return res
          .status(501)
          .json({ error: 'Pass generation not yet implemented' })
      }

      case 'POST': {
        // Register the pass
        const { pushToken } = req.body
        if (!pushToken) {
          console.error('Missing pushToken in request body')
          return res.status(400).json({ error: 'Missing pushToken' })
        }

        await storeRegistration(
          serialNumber as string,
          deviceId as string,
          pushToken,
          passTypeId as string
        )

        console.log('Pass registered successfully:', {
          deviceId,
          passTypeId,
          serialNumber,
          pushToken: pushToken.slice(0, 10) + '...',
        })

        return res.status(201).json({})
      }

      case 'DELETE': {
        // Unregister the pass
        await deleteCardDetails(serialNumber as string)

        console.log('Pass unregistered successfully:', {
          deviceId,
          passTypeId,
          serialNumber,
        })

        return res.status(200).json({})
      }

      default: {
        console.error('Method not allowed:', req.method)
        return res.status(405).json({ error: 'Method not allowed' })
      }
    }
  } catch (error) {
    console.error('Error handling pass registration:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
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
