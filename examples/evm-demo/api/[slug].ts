import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query
  
  console.log('Dynamic route hit!')
  console.log('Slug:', slug)
  console.log('Method:', req.method)
  console.log('URL:', req.url)

  return res.status(200).json({
    message: 'Dynamic route working',
    slug: slug,
    method: req.method,
    url: req.url,
  })
}
