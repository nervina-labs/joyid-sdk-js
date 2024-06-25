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
    console.error(error)
    return false
  }
}

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

interface CredentialInfo {
  pubkey: string
  address: string
  keyType: CredentialKeyType
  alg: SigningAlg
}

/**
 * Verifies the credential information.
 *
 * @param {CredentialInfo} credential Information of the credential to verify.
 * @param {string} joyidServerURL The URL of the JOYID server. <br>
 * Testnet: https://api.testnet.joyid.dev/api/v1 <br>
 * Mainnet: https://api.joy.id/api/v1
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating
 *                              whether the verification was successful.
 */
export async function verifyCredential(
  credential: CredentialInfo,
  joyidServerURL: string
): Promise<boolean>

/**
 * Verifies the credential information.
 *
 * @param {string} pubkey The public key of the credential to verify.
 * @param {string} address The address of the credential to verify.
 * @param {CredentialKeyType} keyType Type of the key.
 * @param {SigningAlg} alg The signing algorithm to be used.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating
 *                              whether the verification was successful.
 */
export async function verifyCredential(
  pubkey: string,
  address: string,
  keyType: CredentialKeyType,
  alg: SigningAlg
): Promise<boolean>

/**
 * Verifies the credential information.
 *
 * @param {string|CredentialInfo} credentialOrPubkey Either the public key or
 *                                                    the `CredentialInfo`.
 * @param {string} addressOrJoyidServerURL Either the address or
 *                                         the `joyidServerURL`.
 * Testnet: https://api.testnet.joyid.dev/api/v1 <br>
 * Mainnet: https://api.joy.id/api/v1
 * @param {CredentialKeyType} _keyType Type of the key.
 * @param {SigningAlg} _alg The signing algorithm to be used.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating
 *                              whether the verification was successful.
 */
export async function verifyCredential(
  credentialOrPubkey: string | CredentialInfo,
  addressOrJoyidServerURL?: string,
  _keyType?: CredentialKeyType,
  _alg?: SigningAlg
): Promise<boolean> {
  let pubkey: string,
    address: string,
    keyType: CredentialKeyType,
    alg: SigningAlg

  let serverURL = getConfig().joyidServerURL

  if (typeof credentialOrPubkey === 'string') {
    pubkey = credentialOrPubkey
    address = addressOrJoyidServerURL!
    keyType = _keyType!
    alg = _alg!
  } else {
    ;({ pubkey, address, keyType, alg } = credentialOrPubkey)
    serverURL = addressOrJoyidServerURL
  }

  try {
    const result = await fetch(`${serverURL}/credentials/${address}`, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
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
    console.error(error)
    return false
  }
}

export { type SigningAlg, type CredentialKeyType } from '@joyid/common'
