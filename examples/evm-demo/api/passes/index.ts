import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log everything about the request
  console.log('Pass Root Request:', {
    method: req.method,
    path: req.url,
    query: req.query,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  })

  // For now, return 200 OK to Apple
  // This endpoint might be used for pass discovery or other operations
  return res.status(200).json({})
} 