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
  /*
  {
    "id": "general_loyalty_1-0x41f2a931F0e3cc70f329B9c5530b604DEd209540",
    "callbackUrl": "https://openpasskeywallet-ckb-demo.vercel.app/api/wallet-pass-callback",
    "params": {
        "templateId": "fa19039a-7e3e-45ed-af60-c1b319b054cb",
        "platform": "google",
        "barcode": {
            "redirect": {
                "url": "https://openpasskeywallet-ckb-demo.vercel.app"
            },
            "altText": "Open Passkey"
        },
        "externalId": "general_loyalty_1-0x41f2a931F0e3cc70f329B9c5530b604DEd209540",
        "pass": {
            "logo": {
                "sourceUri": {
                    "uri": "https://pub-17883891749c4dd484fccf6780697b62.r2.dev/metadataemp/passkey-modified.png"
                }
            },
            "hexBackgroundColor": "#E1AD01",
            "cardTitle": {
                "defaultValue": {
                    "language": "en",
                    "value": "Open Passkey Demo"
                }
            },
            "header": {
                "defaultValue": {
                    "language": "en",
                    "value": "Open Passkey Demo"
                }
            }
        }
    }
}
  */

  // need to design the pass payload here
  const passPayload = {
    id: `${cardId}-${ethAddress}`,
    callbackUrl: `${process.env.ROOT_URL}/api/wallet-pass-callback`,
    params: {
      templateId: templateId,
      platform: 'google',
      barcode: {
        redirect: {
          url: 'https://openpasskeywallet-ckb-demo.vercel.app',
        },
        altText: `${campaign}`,
      },
      externalId: `${cardId}-${ethAddress}`,
      pass: {
        logo: {
          sourceUri: {
            uri: 'https://pub-17883891749c4dd484fccf6780697b62.r2.dev/metadataemp/passkey-modified.png',
          },
        },
        hexBackgroundColor: '#E1AD01',
        cardTitle: {
          defaultValue: {
            language: 'en',
            value: `${campaign} Demo`,
          },
        },
        header: {
          defaultValue: {
            language: 'en',
            value: `${campaign} Demo`,
          },
        },
      },
    },
  }

  console.log(`Pass Payload: ${JSON.stringify(passPayload)}`)

  const myHeaders = new Headers()
  myHeaders.append(
    'x-stl-key',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0IjoiT3BlbktleSBEZW1vIiwiaWF0IjoxNzQ5Nzk5MzQ5fQ.AGsNrwiPbKphCIiN9yBpSZsQbUdP1Mucyib2baNsKwk'
  )
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

  /*const privateKey = process.env.JWT_PRIVATE_KEY
  if (!privateKey) {
    return res.status(500).json({ error: 'No private key set' })
  }

  //body: JSON.stringify({ campaign, ethAddress, cardId }),
  const { campaign, ethAddress, cardId } = req.body
  const issuerId = process.env.ISSUER_ID
  const serviceEmail = process.env.SERVICE_EMAIL

  //const objectSuffix = `${campaign.replace(/[^\w.-]/g, '_')}`
  const loyaltyClassId = `${issuerId}.${cardId}`
  const objectId = `${issuerId}.${cardId}.${ethAddress}`
  const qrcodeData = `${cardId}-${ethAddress}`

  const cardObject = {
    id: objectId,
    classId: loyaltyClassId,
    state: 'active',
    accountId: 'Appreciator',
    accountName: ethAddress,
    loyaltyPoints: {
      balance: {
        string: '0',
      },
      label: 'Points',
    },
    barcode: {
      type: 'QR_CODE',
      value: qrcodeData,
      alternateText: 'Scan',
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

  console.log('ObjectID', objectId)

  const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' })

  if (!campaign || !ethAddress) {
    return res.status(400).json({ error: 'Missing campaign or ethAddress' })
  }

  res.status(200).json({ token })*/
}
