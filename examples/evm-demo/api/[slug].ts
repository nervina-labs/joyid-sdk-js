import { VercelRequest, VercelResponse } from '@vercel/node'
import { useRouter } from 'next/router'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log everything about the request
  console.log('Catch-all route hit!')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Query:', req.query)
  console.log('Body:', req.body)
  console.log('Headers:', req.headers)

  const router = useRouter();

  const slug = router.query.slug;

  console.log('slug', slug);

  // Forward to the actual handler
  return res.status(200).json({
    message: 'Catch-all route hit',
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
  })
}
