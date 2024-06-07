import { type DappConfig, type DappCommunicationType } from './dapp'

export interface toSignInput {
  /**
   * which input to sign
   */
  index: number
  /**
   * (at least specify either an address or a publicKey) Which corresponding private key to use for signing
   */
  address: string
  /**
   * (at least specify either an address or a publicKey) Which corresponding private key to use for signing
   */
  publicKey: string
  /**
   *  (optionals) sighashTypes
   */
  sighashTypes?: number[]
  /**
   * (optionals) When signing and unlocking Taproot addresses, the tweakSigner is used by default for signature generation. Enabling this allows for signing with the original private key.
   */
  disableTweakSigner?: boolean
}

export interface SignPsbtOptions {
  /**
   * whether finalize psbt after signing, default is true
   */
  autoFinalized: boolean
  toSignInputs: toSignInput[]
}

export interface BtcConfig extends DappConfig {
  requestAddressType?: 'p2tr' | 'p2wpkh' | 'auto'
}

export interface SignPsbtRequest extends DappConfig {
  options?: SignPsbtOptions
  signerAddress: string
  tx: string
  redirectURL: string
  commuType?: DappCommunicationType
  isSend?: boolean
}

export interface BatchSignPsbtRequest extends DappConfig {
  options?: SignPsbtOptions[]
  signerAddress: string
  psbts: string[]
  redirectURL: string
  commuType?: DappCommunicationType
  isSend?: boolean
}
