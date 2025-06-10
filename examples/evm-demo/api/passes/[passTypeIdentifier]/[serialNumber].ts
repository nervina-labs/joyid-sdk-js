import { VercelRequest, VercelResponse } from '@vercel/node'
import { CardDetails, getCardDetails } from '../../../src/db'
import {
  createApplePass,
  parseSerialNumber,
  servePass,
} from '../../../src/passkit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the request method and path for debugging
  console.log('Request method:', req.method)
  console.log('Request path:', req.url)

  const { passTypeIdentifier, serialNumber } = req.query

  // Validate required parameters
  if (!passTypeIdentifier || !serialNumber) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  // Handle request for pass update
  if (req.method === 'POST') {
    const { pushToken } = req.body

    // Validate push token
    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' })
    }

    //fetch pass details from db
    const passDetails: CardDetails | null = await getCardDetails(serialNumber)

    if (!passDetails) {
      return res.status(404).json({ error: 'Pass details not found' })
    }

    try {
      // Generate new token and serve. We need to query the token balance from the contract here. For test let's just use 2
      const balance = 2
      //create temp dir here
      const unique = crypto.randomUUID()
      const tempDir = `/tmp/${unique}/temp.pass`

      const { ethAddress, cardId, campaign } = parseSerialNumber(
        serialNumber as string,
        passDetails.campaign
      )

      console.log('ethAddress:', ethAddress)
      console.log('cardId:', cardId)
      console.log('campaign:', campaign)

      const pkpassPath = await createApplePass(
        campaign,
        ethAddress,
        cardId,
        tempDir,
        balance.toString()
      )

      // servePass will send the response, so we don't need to send another one
      await servePass(pkpassPath, tempDir, res)
    } catch (error) {
      console.error('Error serving pass:', error)
      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Failed to serve pass' })
      }
    }
  }

  // Return 405 for non-POST methods
  return res.status(405).json({ error: 'Method not allowed' })
}
