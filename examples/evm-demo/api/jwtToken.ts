// /api/jwtToken.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
//import { GoogleAuth } from 'google-auth-library';
const jwt = require('jsonwebtoken')

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const privateKey = process.env.JWT_PRIVATE_KEY
  if (!privateKey) {
    return res.status(500).json({ error: 'No private key set' })
  }

  const { campaign, ethAddress, cardId } = req.body
  const issuerId = process.env.ISSUER_ID
  const serviceEmail = process.env.SERVICE_EMAIL

  const objectSuffix = `${campaign.replace(/[^\w.-]/g, '_')}`
  const loyaltyClassId = `${issuerId}.${cardId}`
  const objectId = `${issuerId}.${objectSuffix}.${ethAddress}`

  const cardObject = {
    id: objectId,
    classId: loyaltyClassId,
    state: 'active',
    accountId: 'Appreciator',
    accountName: ethAddress,
    loyaltyPoints: {
      balance: {
        string: '1',
      },
      label: 'Points',
    },
    barcode: {
      type: 'QR_CODE',
      value: ethAddress,
    },
  }

  const claims = {
    iss: serviceEmail,
    aud: 'google',
    origins: [],
    typ: 'savetowallet',
    payload: {
      loyaltyObjects: [cardObject],
    },
  }

  const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' })

  if (!campaign || !ethAddress) {
    return res.status(400).json({ error: 'Missing campaign or ethAddress' })
  }

  res.status(200).json({ token })
}
