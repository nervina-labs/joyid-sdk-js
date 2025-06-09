import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Passes route hit!')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Query:', req.query)

  // Parse the URL to get the path segments
  const url = new URL(req.url || '', 'http://localhost')
  const pathSegments = url.pathname.split('/').filter(Boolean)
  
  // Remove 'api' and 'passes' from the segments
  const segments = pathSegments.slice(2)
  console.log('Path segments:', segments)

  return res.status(200).json({
    message: 'Passes route working',
    method: req.method,
    url: req.url,
    segments: segments
  })
} 