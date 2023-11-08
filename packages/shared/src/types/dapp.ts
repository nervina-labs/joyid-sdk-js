import type { RequireExactlyOne } from 'type-fest'
import type { CredentialKeyType, SigningAlg } from './key'

export type Base64URLString = string

export type RequestNetwork = 'nervos' | 'nostr' | 'ethereum'

export interface BaseRequest {
  redirectURL: string
  joyidAppURL?: string
}

type Hex = `0x${string}`

export interface AuthRequest extends BaseRequest {
  requestNetwork?: RequestNetwork
  name?: string
  logo?: string
  challenge?: string
  state?: unknown
}

export enum DappRequestType {
  Auth = 'Auth',
  SignMessage = 'SignMessage',
  SignEvm = 'SignEvm',
  SignCkbTx = 'SignCkbTx',
  SignCotaNFT = 'SignCotaNFT',
  SignNostrEvent = 'SignNostrEvent',
  EncryptNostrMessage = 'EncryptNostrMessage',
  DecryptNostrMessage = 'DecryptNostrMessage',
}

export enum DappCommunicationType {
  Popup = 'popup',
  Redirect = 'redirect',
}

export interface SignMessageResponseData {
  signature: string
  /**
   * The message that was signed by the authenticator,
   * Note that the message is not the original raw message,
   * but is combined with client data and authenticator data
   * according to [WebAuthn Spec](https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion).
   */
  message: string
  /**
   * The public key used to sign the message
   */
  pubkey: string
  /**
   * The message that was requested to be signed
   */
  challenge: string

  attestation?: string

  keyType: CredentialKeyType

  alg: SigningAlg

  state?: any

  requestNetwork?: RequestNetwork
}

export interface AuthResponseData extends Partial<SignMessageResponseData> {
  address: string
  ethAddress: string
  nostrPubkey: string
  pubkey: string
  challenge?: string
  message?: string
  keyType: CredentialKeyType
  alg: SigningAlg
}

export interface DappResponse<T> {
  error: string
  data: T
  state?: any
}

export type AuthResponse = {
  type: DappRequestType.Auth
} & RequireExactlyOne<DappResponse<AuthResponseData>, 'data' | 'error'>

export type SignMessageResponse = {
  type: DappRequestType.SignMessage
} & RequireExactlyOne<DappResponse<SignMessageResponseData>, 'data' | 'error'>
export interface BaseSignMessageRequest extends AuthRequest {
  challenge: string
  isData?: boolean
  address?: string
  requestNetwork?: RequestNetwork
}

export interface SignEvmTxResponseData {
  tx: Hex
  state?: any
}

export type SignEvmResponse = {
  type: DappRequestType.SignEvm
} & RequireExactlyOne<DappResponse<SignEvmTxResponseData>, 'data' | 'error'>

export type SignMessageRequest = RequireExactlyOne<
  BaseSignMessageRequest,
  'address'
>

export interface SignCkbTxResponseData {
  tx: any
  state?: any
}

export type SignCkbTxResponse = {
  type: DappRequestType.SignCkbTx
} & RequireExactlyOne<DappResponse<SignCkbTxResponseData>, 'data' | 'error'>

export type SignCotaNFTResponseData = SignCkbTxResponseData

export type SignCotaNFTResponse = {
  type: DappRequestType.SignCotaNFT
} & RequireExactlyOne<DappResponse<SignCotaNFTResponseData>, 'data' | 'error'>

export const SESSION_KEY_VER = '00'
