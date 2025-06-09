import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createApplePass, servePass } from '../src/passkit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const privateKey = process.env.JWT_PRIVATE_KEY
  if (!privateKey) {
    return res.status(500).json({ error: 'No private key set' })
  }

  const { campaign, ethAddress, cardId } = req.body

  if (!campaign || !ethAddress) {
    return res.status(400).json({ error: 'Missing campaign or ethAddress' })
  }

  //create temp dir here
  const unique = crypto.randomUUID()
  const tempDir = `/tmp/${unique}/temp.pass`

  const pkpassPath = await createApplePass(
    campaign,
    ethAddress,
    cardId,
    tempDir,
    "0"
  )

  await servePass(pkpassPath, tempDir, res)
}
