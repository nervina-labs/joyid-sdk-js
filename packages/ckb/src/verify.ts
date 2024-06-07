/* eslint-disable global-require */
import fetch from 'cross-fetch'
import { subtle } from 'uncrypto'
import {
  SigningAlg,
  type CredentialKeyType,
  getConfig,
  type SignMessageResponseData,
  bufferToHex,
  appendBuffer,
  base64URLStringToBuffer,
  bufferToBase64URLString,
  hexToArrayBuffer,
  hexToString,
  utf8StringToBuffer,
} from '@joyid/common'
import { derToIEEE } from './utils'

export const ensureChallenge = (
  challenge: string,
  clientData: ArrayBuffer
): boolean => {
  try {
    const clienDataJSON = hexToString(bufferToHex(clientData))
    const clientDataObj = JSON.parse(clienDataJSON)
    return (
      clientDataObj.challenge ===
      bufferToBase64URLString(utf8StringToBuffer(challenge))
    )
  } catch (error) {
    return false
  }
}

export const verifySessionKeySignature = async (
  message: string,
  signature: string,
  pubkey: string
): Promise<boolean> => {
  try {
    const algoName = 'RSASSA-PKCS1-v1_5'
    const pk = hexToArrayBuffer(pubkey)
    const msg = base64URLStringToBuffer(message)
    const sig = base64URLStringToBuffer(signature)
    const e = new Uint8Array(pk.slice(0, 3)).reverse()
    const n = new Uint8Array(pk.slice(4)).reverse()

    // import rsa public key as RSASSA-PKCS1-v1_5	subtle key
    const jwkPubkey: JsonWebKey = {
      alg: 'RS256',
      ext: true,
      key_ops: ['verify'],
      kty: 'RSA',
      e: bufferToBase64URLString(e),
      n: bufferToBase64URLString(n),
    }
    const key = await subtle.importKey(
      'jwk',
      jwkPubkey,
      {
        name: algoName,
        hash: 'SHA-256',
      },
      false,
      ['verify']
    )
    const res = await subtle.verify(algoName, key, sig, msg)
    return res
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return false
  }
}

export type { SigningAlg, CredentialKeyType }

export const verifyNativeKeySignature = async ({
  message,
  signature,
  pubkey,
  challenge,
  alg,
}: SignMessageResponseData): Promise<boolean> => {
  try {
    const pk = hexToArrayBuffer(`${pubkey}`)
    const msg = base64URLStringToBuffer(message)
    const sig = base64URLStringToBuffer(signature)
    const authData = msg.slice(0, 37)
    const clientData = msg.slice(37)
    if (!ensureChallenge(challenge, clientData)) {
      return false
    }
    const clientDataHash = await subtle.digest('SHA-256', clientData)
    const signatureBase = appendBuffer(authData, clientDataHash)
    const isR1 = alg === SigningAlg.ES256
    const jwkPubkey: JsonWebKey = isR1
      ? {
          kty: 'EC',
          crv: 'P-256',
          x: bufferToBase64URLString(pk.slice(0, 32)),
          y: bufferToBase64URLString(pk.slice(32)),
        }
      : {
          alg: 'RS256',
          ext: true,
          key_ops: ['verify'],
          kty: 'RSA',
          e: bufferToBase64URLString(new Uint8Array(pk.slice(0, 3)).reverse()),
          n: bufferToBase64URLString(new Uint8Array(pk.slice(4)).reverse()),
        }
    const algo = isR1
      ? {
          name: 'ECDSA',
          namedCurve: 'P-256',
          hash: { name: 'SHA-256' },
        }
      : {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        }
    const key = await subtle.importKey('jwk', jwkPubkey, algo, false, [
      'verify',
    ])
    const res = await subtle.verify(
      algo,
      key,
      alg === SigningAlg.RS256 ? sig : derToIEEE(sig),
      signatureBase
    )
    return res
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return false
  }
}

export const verifySignature = async (
  data: SignMessageResponseData
): Promise<boolean> => {
  const { message, signature, pubkey, keyType } = data
  if (keyType === 'main_key' || keyType === 'sub_key') {
    return verifyNativeKeySignature(data)
  }
  return verifySessionKeySignature(message, signature, pubkey)
}

export const verifyCredential = async (
  pubkey: string,
  address: string,
  keyType: CredentialKeyType,
  alg: SigningAlg
): Promise<boolean> => {
  const serverURL = getConfig().joyidServerURL
  try {
    const result = await fetch(`${serverURL}/credentials/${address}`, {
      method: 'GET',
    }).then(async (res) => res.json())

    return result.credentials.some((c: any) => {
      const pk =
        alg === SigningAlg.RS256 ||
        keyType === 'main_session_key' ||
        keyType === 'sub_session_key'
          ? c.public_key
          : c.public_key.slice(2)
      return c.ckb_address === address && pk === pubkey
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return false
  }
}
