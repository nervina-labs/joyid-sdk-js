// /api/jwtToken.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPass, CardCache } from '../src/db'
//import { GoogleAuth } from 'google-auth-library';
//import jwt from 'jsonwebtoken'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // input is cardId (user card) and point count (integer)
  const { cardName, cardId, points } = req.body

  // we need to fetch the UID from the cardId
  const card = await getPass(cardId)

  if (!card) {
    return res.status(404).json({ error: 'Card not found' })
  }

  console.log(`Card fetched: ${JSON.stringify(card)}`)
  //switch google/apple
  const platform = card.platform
  let data = null
  if (platform === 'google') {
    // google
    data = await setGooglePoints(card, points, cardName)
  } else if (platform === 'apple') {
    // apple
    data = await setApplePoints(card, points, cardName, cardId)
  } else {
    return res.status(400).json({ error: 'Invalid platform' })
  }

  return data
    ? res.status(200).json(data)
    : res.status(400).json({ error: 'Failed to set points' })
}

async function setGooglePoints(
  card: CardCache,
  points: number,
  cardName: string
): Promise<any> {
  console.log(`Setting Google points: ${card.passId} ${points}`)

  // form the payload
  const passPayload = {
    id: card.passId,
    params: {
      message: {
        header: `${cardName}`,
        body: 'Token Received',
        id: 'tokens_received',
        message_type: 'TEXT',
      },
      pass: {
        logo: {
          sourceUri: {
            uri: 'https://pub-17883891749c4dd484fccf6780697b62.r2.dev/metadataemp/passkey-modified.png',
          },
        },
        loyaltyPoints: {
          balance: {
            string: `${points}`,
          },
          label: 'Points',
        },
      },
    },
  }

  /*
  {"params":{"message":{"header":"Open Passkey","body":"Token Received","id":"tokens_received","message_type":"TEXT_AND_NOTIFY"},"pass":{"logo":{"sourceUri":{"uri":"https://pub-17883891749c4dd484fccf6780697b62.r2.dev/metadataemp/passkey-modified.png"}},"loyaltyPoints":{"balance":{"string":"16"},"label":"Points"}}}}
  */

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
  return response.json()
}

async function setApplePoints(
  card: CardCache,
  points: number,
  cardName: string,
  cardId: string
): Promise<any> {
  console.log(`Setting Apple points: ${card.passId} ${points}`)

  // form the payload
  const passPayload = {
    id: card.passId,
    params: {
      pass: {
        backFields: [
          {
            key: 'note',
            value: 'Update1',
          },
          {
            key: 'website',
            label: 'Link',
            attributedValue: 'Update2',
            value: `${process.env.ROOT_URL}/home?campaign=${cardName}&card_id=${cardId}`,
          },
          {
            key: 'notification',
            label: 'Token received',
            value: 'Token received',
            changeMessage: '%@',
            textAlignment: 'PKTextAlignmentNatural',
          },
        ],
        secondaryFields: [
          {
            key: 'points',
            textAlignment: 'PKTextAlignmentLeft',
            label: 'Points',
            value: `${points}`,
          },
        ],
      },
    },
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
  return response.json()
}
