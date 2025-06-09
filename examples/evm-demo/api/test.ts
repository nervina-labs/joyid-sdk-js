import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Test route hit!')
  console.log('Method:', req.method)
  console.log('URL:', req.url)

  return res.status(200).json({
    message: 'Test route working',
    method: req.method,
    url: req.url,
  })
}
