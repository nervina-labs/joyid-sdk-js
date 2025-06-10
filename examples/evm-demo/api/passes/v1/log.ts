import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log everything about the request
  console.log('Pass Log Request:', {
    method: req.method,
    path: req.url,
    query: req.query,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
  })

  // Always return 200 OK to Apple
  return res.status(200).json({})
}
