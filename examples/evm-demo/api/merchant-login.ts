import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body || {}
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing username or password' })
  }

  try {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    if (process.env.BEARER_TOKEN) {
      headers.append('Authorization', `Bearer ${process.env.BEARER_TOKEN}`)
    }

    // Forward request to backend
    const response = await fetch(
      `${process.env.WALLET_PASS_URL}/merchant-logins/sign-in`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, password }),
      }
    )

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error: any) {
    console.error('Merchant login error:', error)
    return res.status(500).json({
      success: false,
      message: 'login failed',
    })
  }
}
