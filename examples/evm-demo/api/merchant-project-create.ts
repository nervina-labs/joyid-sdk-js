import type { VercelRequest, VercelResponse } from '@vercel/node'
import { storeMerchantApiKey } from '../src/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { projectName, username } = req.body
  if (!projectName || !username) {
    return res.status(400).json({ error: 'Missing projectName or username' })
  }

  try {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    if (process.env.BEARER_TOKEN) {
      headers.append('Authorization', `Bearer ${process.env.BEARER_TOKEN}`)
    }

    // Step 1: Create the project to get an API key
    const projectResponse = await fetch(
      `${process.env.WALLET_PASS_URL}/project`,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ project: projectName }),
      }
    )

    const projectData = await projectResponse.json()

    if (!projectResponse.ok) {
      return res.status(projectResponse.status).json({
        success: false,
        message: projectData.message || 'Error creating project',
      })
    }
    
    // Step 1.5: Store the API key
    if (projectData.apiKey) {
      await storeMerchantApiKey(username, projectData.apiKey)
    }
    
    // Step 2: Create the issuer
    const issuerResponse = await fetch(
      `${process.env.WALLET_PASS_URL}/create-issuer`,
      {
        method: 'POST',
        headers: headers, // Re-using the same headers
        body: JSON.stringify({ username: username, cardName: projectName }),
      }
    )

    const issuerData = await issuerResponse.json()

    if (!issuerResponse.ok) {
      return res.status(issuerResponse.status).json({
        success: false,
        message: issuerData.message || 'Error creating issuer',
      })
    }
    
    // Return the successful response from the second call
    return res.status(200).json({ success: true, ...issuerData })

  } catch (error: any) {
    console.error('Project creation process error:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' })
  }
}
