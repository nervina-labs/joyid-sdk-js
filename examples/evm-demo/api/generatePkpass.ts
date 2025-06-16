// /api/jwtToken.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
//import { GoogleAuth } from 'google-auth-library';
//import jwt from 'jsonwebtoken'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // this function now just calls an API service to create a pass
  // the remote API will call the wallet-pass-callback API to store the pass
  const { campaign, ethAddress, cardId } = req.body

  //need a database of cardId to templateId
  const templateId = 'fa19039a-7e3e-45ed-af60-c1b319b054cb'

  const passPayload = {
    id: `${cardId}-${ethAddress}`,
    callbackUrl: `${process.env.ROOT_URL}/api/wallet-pass-callback`,
    "params": {
      "templateId": templateId,
      "platform": "apple",
      "barcode": {
        "redirect": {
          "url": `${process.env.ROOT_URL}`
        },
        "altText": `${campaign}`
      },
      "externalId": `${cardId}-${ethAddress}`,
      "pass": {
        "description": `${campaign} Demo`,
        "backFields": [
          {
            "key": "website",
            "label": "Link",
            "attributedValue": "Website",
            "value": `${process.env.ROOT_URL}/home?campaign=${campaign}&card_id=${cardId}`
          }
        ],
        "secondaryFields": [
          {
            "key": "points",
            "textAlignment": "PKTextAlignmentLeft",
            "label": "Points",
            "value": "0"
          }
        ],
        "auxiliaryFields": [
          {
            "key": "tier",
            "label": "Tier",
            "value": "Appreciator"
          },
          {
            "key": "userAddr",
            "label": "Member Address",
            "value": `${ethAddress}`
          }
        ]
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
      method: 'POST',
      body: JSON.stringify(passPayload),
      headers: myHeaders,
      redirect: 'follow',
    }
  )
  const data = await response.json()
  res.status(200).json(data)

}
