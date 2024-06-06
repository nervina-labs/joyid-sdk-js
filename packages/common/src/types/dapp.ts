import type { RequireExactlyOne } from 'type-fest'
import type { CKBTransaction } from './ckb'

export enum SigningAlg {
  RS256 = -257,
  ES256 = -7,
}

export interface JoyIDConfig {
  joyidAppURL?: string
  joyidServerURL?: string
}

export interface DappConfig extends JoyIDConfig {
  // name of your app
  name?: string
  // logo of your app
  logo?: string
  // custom state that will be returned to your app after authentication
  state?: unknown
}

export type SessionKeyType = 'main_session_key' | 'sub_session_key'
export type WebauthnKeyType = 'main_key' | 'sub_key'
export type CredentialKeyType = SessionKeyType | WebauthnKeyType

export type Base64URLString = string

export type RequestNetwork =
  | 'nervos'
  | 'nostr'
  | 'ethereum'
  | 'btc-p2tr'
  | 'btc-p2wpkh'
  | 'btc-auto'

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

export interface MiniAppBaseRequest {
  name: string
  logo: string
  miniAppToken: string
  callbackUrl: string
  joyidAppURL?: string
}

export interface MiniAppAuthRequest extends MiniAppBaseRequest {
  requestNetwork?: RequestNetwork
  challenge?: string
}

export enum DappRequestType {
  Auth = 'Auth',
  SignMessage = 'SignMessage',
  SignEvm = 'SignEvm',
  SignPsbt = 'SignPsbt',
  BatchSignPsbt = 'BatchSignPsbt',
  SignCkbTx = 'SignCkbTx',
  SignCotaNFT = 'SignCotaNFT',
  SignCkbRawTx = 'SignCkbRawTx',
  SignNostrEvent = 'SignNostrEvent',
  EncryptNostrMessage = 'EncryptNostrMessage',
  EvmWeb2Login = 'EvmWeb2Login',
  DecryptNostrMessage = 'DecryptNostrMessage',
  AuthMiniApp = 'AuthMiniApp',
  SignMiniAppMessage = 'SignMiniAppMessage',
  SignMiniAppEvm = 'SignMiniAppEvm',
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
  btcAddressType?: 'p2tr' | 'p2wpkh'
  taproot: {
    address: string
    pubkey: string
  }
  nativeSegwit: {
    address: string
    pubkey: string
  }
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

export interface MiniAppSignMessageRequest extends MiniAppBaseRequest {
  requestNetwork?: RequestNetwork
  challenge?: string
  isData?: boolean
  address: string
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

export type BtcSignMessageType = 'bip322-simple' | 'ecdsa'

export interface BtcSignMessageRequest extends SignMessageRequest {
  signMessageType: BtcSignMessageType
}

export interface SignCkbTxResponseData {
  tx: CKBTransaction
  state?: any
}

export type SignCkbTxResponse = {
  type: DappRequestType.SignCkbTx
} & RequireExactlyOne<DappResponse<SignCkbTxResponseData>, 'data' | 'error'>

export type SignCotaNFTResponseData = SignCkbTxResponseData

export type SignCotaNFTResponse = {
  type: DappRequestType.SignCotaNFT
} & RequireExactlyOne<DappResponse<SignCotaNFTResponseData>, 'data' | 'error'>

export type SignCkbRawTxResponseData = SignCkbTxResponseData

export type SignCkbRawTxResponse = {
  type: DappRequestType.SignCkbRawTx
} & RequireExactlyOne<DappResponse<SignCkbRawTxResponseData>, 'data' | 'error'>

export const SESSION_KEY_VER = '00'
