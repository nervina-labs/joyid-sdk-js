import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log everything about the request
  console.log('Passes API Request:', {
    method: req.method,
    path: req.url,
    fullPath: req.url,
    query: req.query,
    params: req.params,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
  })

  // Return 404 for now - we'll handle the actual routing in the specific handlers
  return res.status(404).json({ error: 'Not found' })
} 