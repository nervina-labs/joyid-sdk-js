import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log everything about the request
  console.log('Passes API Request (2):', {
    method: req.method,
    path: req.url,
    fullPath: req.url,
    query: req.query,
    params: req.params,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
    },
    body: req.body,
    timestamp: new Date().toISOString(),
  })

  // Handle root pass endpoint
  if (req.url === '/api/passes/') {
    // Return 200 OK to indicate the pass service is available
    return res.status(200).json({
      version: 'v1',
      endpoints: {
        passes: '/api/passes/v1',
        devices: '/api/passes/v1/devices',
        log: '/api/passes/v1/log'
      }
    })
  }

  // For all other paths, return 404
  return res.status(404).json({ error: 'Not found' })
}
