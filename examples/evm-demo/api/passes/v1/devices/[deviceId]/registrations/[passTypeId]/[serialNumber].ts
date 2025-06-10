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

  // Handle registration
  if (req.method === 'POST') {
    const { pushToken } = req.body

    // Validate push token
    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' })
    }

    try {
      // Try immediate registration first
      try {
        await storeRegistration(
          serialNumber as string,
          deviceId as string,
          pushToken,
          passTypeId as string
        )
        console.log('Registration stored immediately:', {
          deviceId,
          passTypeId,
          serialNumber,
          pushToken,
        })
      } catch (error: any) {
        // If immediate registration fails with "record not found", try with retries
        if (error.message.includes('Campaign record not found')) {
          console.log('Campaign record not found, starting retry loop...')
          let retries = 10 // Try up to 10 times
          
          while (retries > 0) {
            try {
              await storeRegistration(
                serialNumber as string,
                deviceId as string,
                pushToken,
                passTypeId as string
              )
              console.log(`Registration stored successfully after retry: ${11-retries}`, {
                deviceId,
                passTypeId,
                serialNumber,
              })
              break // Success, exit the loop
            } catch (retryError: any) {
              console.log(`Registration attempt ${11-retries} failed:`, retryError.message)
              
              // If it's not a "record not found" error, fail immediately
              if (!retryError.message.includes('Campaign record not found')) {
                console.error('Fatal error during registration retry:', retryError)
                throw retryError
              }
              
              // Wait 2 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 2000))
              retries--
            }
          }
          
          if (retries === 0) {
            console.error('Failed to register after all retries')
          }
        } else {
          // For other errors, fail immediately
          throw error
        }
      }

      // Return 201 Created as per Apple's specification
      return res.status(201).json({})
    } catch (error) {
      console.error('Error storing registration:', error)
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
