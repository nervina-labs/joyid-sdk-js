// /api/jwtToken.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPass } from '../src/db'
//import { GoogleAuth } from 'google-auth-library';
//import jwt from 'jsonwebtoken'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // input is cardId (user card) and point count (integer)
  const { cardName, cardId, points } = req.body

  // we need to fetch the UID from the cardId
  const card = await getPass(cardId);

  if (!card) {
    return res.status(404).json({ error: 'Card not found' })
  }

  // form the payload
  const passPayload = {
    "id": card.id,
    "params": {
      "message": {
        "header": `${cardName}`,
        "body": "Token Received",
        "id": "tokens_received",
        "message_type": "TEXT_AND_NOTIFY"
      },
      "pass": {
            "logo": {
                "sourceUri": {
                    "uri": "https://pub-17883891749c4dd484fccf6780697b62.r2.dev/metadataemp/passkey-modified.png"
                }
            },
            "loyaltyPoints": {
                "balance": {
                    "string": `${points}`
                },
            "label": "Points"
            }  
        }
    }
  }

  console.log(`Pass Payload: ${JSON.stringify(passPayload)}`)

  const myHeaders = new Headers()
  myHeaders.append('x-stl-key', `${process.env.X_STL_KEY}`)
  myHeaders.append('Content-Type', 'application/json')

  const response = await fetch(
    'https://54-88-67-169.sslip.io:3005/wallet-passes',
    {
      method: 'PUT',
      body: JSON.stringify(passPayload),
      headers: myHeaders,
      redirect: 'follow',
    }
  )
  const data = await response.json()
  res.status(200).json(data)
}