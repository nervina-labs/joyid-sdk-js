import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'node:fs'
import { PKPass } from 'passkit-generator'
import path from 'node:path'
import https from 'node:https'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const privateKey = process.env.JWT_PRIVATE_KEY
  if (!privateKey) {
    return res.status(500).json({ error: 'No private key set' })
  }

  const { campaign, ethAddress, cardId } = req.body

  if (!campaign || !ethAddress) {
    return res.status(400).json({ error: 'Missing campaign or ethAddress' })
  }

  const pkpassPath = await createApplePass(campaign, ethAddress, cardId)

  // Read the .pkpass file as a buffer
  const pkpassBuffer = fs.readFileSync(pkpassPath)

  console.log('PKPass buffer length:', pkpassBuffer.length)

  // Set headers for file download
  res.setHeader('Content-Type', 'application/vnd.apple.pkpass')
  res.setHeader('Content-Disposition', 'attachment; filename="card.pkpass"')
  res.status(200).send(pkpassBuffer)
}

// async function fetchAssetToTmp(filename: string, destDir: string) {
//   const assetUrl = `https://${process.env.VERCEL_URL}/pass-assets/${filename}`
//   const res = await fetch(assetUrl)
//   if (!res.ok) throw new Error(`Failed to fetch ${assetUrl}`)
//   const arrayBuffer = await res.arrayBuffer()
//   const buffer = Buffer.from(arrayBuffer)
//   fs.writeFileSync(path.join(destDir, filename), buffer)
// }

async function fetchAssetToTmp(filename: string, destPath: string) {
  return new Promise((resolve, reject) => {
    const assetUrl = `https://${process.env.VERCEL_URL}/pass-assets/${filename}`
    const file = fs.createWriteStream(path.join(destPath, filename))
    https
      .get(assetUrl, (response: any) => {
        response.pipe(file)
        file.on('finish', () => {
          file.close(resolve)
        })
        file.on('error', (err: any) => {
          fs.unlink(destPath, () => reject(err))
        })
      })
      .on('error', (err: any) => {
        fs.unlink(destPath, () => reject(err))
      })
  })
}

async function copyPassAssetsToTmp(tempDir: string) {
  const assetFiles = [
    'icon.png',
    'logo.png',
    'icon@2x.png',
    'icon@3x.png',
    'logo@2x.png',
    'logo@3x.png',
  ] // etc.
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }
  for (const file of assetFiles) {
    await fetchAssetToTmp(file, tempDir)
  }
  /*const srcDir = path.join(process.cwd(), 'pass-assets')
    //const srcDir = path.join(process.cwd(), 'public', 'pass-assets')
    const destDir = `${tempDir}`
  
    console.log('CWD:', process.cwd())
    console.log('Looking for pass assets in:', srcDir)
    console.log('Directory exists:', fs.existsSync(srcDir))
    if (fs.existsSync(srcDir)) {
      console.log('Files:', fs.readdirSync(srcDir))
    }
  
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }
  
    const files = fs.readdirSync(srcDir)
    for (const file of files) {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file))
    }*/
}

async function createApplePass(
  campaign: string,
  ethAddress: string,
  cardId: string
): Promise<string> {
  const tempDir = '/tmp/temp.pass'
  const passJsonPath = `${tempDir}/pass.json`

  // Ensure the temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  await copyPassAssetsToTmp(tempDir)

  //create UID for serial number
  const uid = `${cardId}-${ethAddress}`

  const pass = {
    description: `Loyalty card for ${campaign}`,
    formatVersion: 1,
    organizationName: `${campaign}`,
    passTypeIdentifier: 'pass.com.stl-example.coffee-loyalty-1',
    serialNumber: uid,
    teamIdentifier: 'LRAW5PL536',
    storeCard: {
      primaryFields: [
        {
          key: 'points',
          label: 'Points',
          value: '0',
        },
      ],
      auxiliaryFields: [
        {
          key: 'tier',
          label: 'Tier',
          value: 'Appreciator',
        },
        {
          key: 'userAddr',
          label: 'Member Address',
          value: `${ethAddress}`,
        },
      ],
    },
    backgroundColor: 'rgb(225, 173, 1)',
    logoText: `${campaign}`,
  }

  //now store the json to /temp directory
  fs.writeFileSync(passJsonPath, JSON.stringify(pass, null, 2))

  const wwdr = Buffer.from(process.env.APPLE_WWDR_PEM || '', 'utf8')
  const signerCert = Buffer.from(
    process.env.APPLE_SIGNER_CERT_PEM || '',
    'utf8'
  )
  const signerKey = Buffer.from(process.env.APPLE_SIGNER_KEY_PEM || '', 'utf8')

  // Now generate the pass
  const passFull = await PKPass.from(
    {
      model: tempDir,
      certificates: {
        wwdr: wwdr,
        signerCert: signerCert,
        signerKey: signerKey,
      },
    },
    {
      // keys to be added or overridden
      serialNumber: uid,
    }
  )

  passFull.setBarcodes({
    message: `${uid}`,
    format: 'PKBarcodeFormatQR',
  })

  // Save the .pkpass file
  const outPath = `/tmp/${uid}.pkpass`
  const stream = passFull.getAsStream()
  const outStream = stream.pipe(fs.createWriteStream(outPath))
  stream.pipe(outStream)

  await new Promise((resolve, reject) => {
    outStream.on('finish', resolve)
    outStream.on('error', reject)
  })

  console.log(`Pass saved to ${outPath}`)
  return outPath
}
