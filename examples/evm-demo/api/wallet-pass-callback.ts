import type { VercelRequest, VercelResponse } from '@vercel/node'
//import { createApplePass, servePass } from '../src/passkit'
import { storePass } from '../src/db'

// In-memory map of waiting SSE connections
const sseClients: Record<string, VercelResponse> = {}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Handle webhook/callback
    const { id, result, signedMessage } = req.body

    if (!id || !result || !signedMessage) {
      return res
        .status(400)
        .json({ error: 'Missing id, result, or signedMessage' })
    }

    await storePass(id, result.id, result.platform, result.fileURL)

    // If a client is waiting for this id, notify via SSE
    if (sseClients[id]) {
      sseClients[id].write(
        `data: ${JSON.stringify({ fileURL: result.fileURL })}\n\n`
      )
      sseClients[id].end()
      delete sseClients[id]
    }

    return res.status(200).send()
  }

  if (req.method === 'GET') {
    // For SSE: /api/wallet-pass-callback?id=EXTERNAL_ID
    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing id in query' })
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Keep the connection open
    res.write(': connected\n\n')

    // Store the response object for this id
    sseClients[id] = res

    // Clean up if the client disconnects
    req.on('close', () => {
      delete sseClients[id]
    })
    // Do not end the response here!
    return
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' })
}
