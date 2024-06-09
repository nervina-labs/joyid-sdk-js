/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import {
  type CKBTransaction,
  createBlockDialog,
  buildJoyIDURL,
  openPopup,
  runPopup,
  type PopupConfigOptions,
  authWithPopup,
  signMessageWithPopup,
  internalConfig as internalDappConfig,
  type CkbDappConfig,
  DappRequestType,
  type CkbTransactionRequest,
  type CotaNFTTransactionRequest,
  type SignCotaNFTRequest,
  type AuthRequest,
  type AuthResponse,
  type SignMessageRequest,
  type SignMessageResponse,
  type SignCkbTxResponseData,
  type AuthResponseData,
  type SignMessageResponseData,
  type SignCkbTxRequest,
  bufferToHex,
  append0x,
  remove0x,
  type CredentialKeyType,
  SigningAlg,
} from '@joyid/common'
import {
  addressToScript,
  blake160,
  serializeScript,
} from '@nervosnetwork/ckb-sdk-utils'
import { Aggregator } from './aggregator'
import {
  getJoyIDCellDep,
  getJoyIDLockScript,
  getCotaTypeScript,
  getCotaCellDep,
} from './constants'
export * from './verify'

export {
  openPopup,
  Aggregator,
  getJoyIDCellDep,
  getJoyIDLockScript,
  getCotaTypeScript,
  getCotaCellDep,
  SigningAlg,
}

export type {
  CkbDappConfig,
  PopupConfigOptions as PopupConifg,
  SignMessageResponseData as SignChallengeResponseData,
  AuthResponseData as ConnectResponseData,
  SignCotaNFTRequest,
  CotaNFTTransactionRequest,
  CKBTransaction,
  AuthRequest,
  AuthResponse,
  SignCkbTxRequest,
  SignMessageResponse,
  SignMessageRequest,
  CredentialKeyType,
}

const appendPrefix = (tokenKey?: string): string | undefined => {
  if (!tokenKey) {
    return tokenKey
  }
  const key = remove0x(tokenKey)
  // the length of CoTA NFT token key is 24 bytes and mNFT is 28 bytes
  if (key.length === 48) {
    return `ffffffff${key}`
  }
  return key
}

const generateSignURL = (
  config: SignCkbTxRequest | SignCotaNFTRequest,
  isCkb = true
): string => {
  const { joyidAppURL: __, joyidServerURL: _, ...ckbDappConfig } = config
  const path = isCkb ? '/sign-ckb' : '/sign-cota-nft'
  const dappConfig = ckbDappConfig
  if (!isCkb) {
    const tx = dappConfig.tx as CotaNFTTransactionRequest
    tx.tokenKey = appendPrefix(tx.tokenKey)
    dappConfig.tx = tx
  }
  return buildJoyIDURL(dappConfig, 'popup', path)
}

export const initConfig = (config?: CkbDappConfig): CkbDappConfig => {
  Object.assign(internalDappConfig, config)
  return internalDappConfig as CkbDappConfig
}

export const getConfig = (): CkbDappConfig => internalDappConfig

// The witnessIndex represents the position of the first JoyID cell in inputs, and the default value is 0.
// The witnessLastIndex represents the position of the last JoyID cell in inputs, and the default value is inputs.length - 1
// The witnessLastIndex must not be smaller than witnessIndex.
// For example: witnessIndex = 1, witnessLastIndex = 3, this means the inputs[1..3] are JoyID cell, and the other inputs are another lock scripts.
export type SignConfig = CkbDappConfig &
  Pick<PopupConfigOptions, 'timeoutInSeconds' | 'popup'> & {
    witnessIndex?: number
    witnessLastIndex?: number
  }

export const connect = async (
  config?: SignConfig
): Promise<AuthResponseData> => {
  config = {
    ...internalDappConfig,
    ...config,
  }
  const res = await authWithPopup({
    redirectURL: location.href,
    ...config,
  })
  return res
}

export const signChallenge = async (
  challenge: string | Uint8Array,
  signerAddress: string,
  config?: SignConfig
): Promise<SignMessageResponseData> => {
  const isData = typeof challenge !== 'string'

  config = {
    ...internalDappConfig,
    ...config,
  }
  const res = await signMessageWithPopup({
    challenge:
      typeof challenge !== 'string' ? bufferToHex(challenge) : challenge,
    isData,
    address: signerAddress,
    redirectURL: location.href,
    ...config,
  })

  return res
}

export const signTransaction = async (
  tx: CkbTransactionRequest,
  config?: SignConfig
): Promise<CKBTransaction> => {
  config = {
    ...internalDappConfig,
    ...config,
  }

  if (!config.popup) {
    config.popup = openPopup('')

    if (!config.popup) {
      return createBlockDialog(async () => signTransaction(tx, config))
    }
  }

  const { popup, timeoutInSeconds, ...dappConfig } = config

  config.popup.location.href = generateSignURL({
    ...dappConfig,
    tx,
    signerAddress: tx.from,
    redirectURL: location.href,
  })

  const res = await runPopup({
    timeoutInSeconds: timeoutInSeconds ?? 5000,
    popup,
    type: DappRequestType.SignCkbTx,
  })

  return res.tx
}

export const signCotaNFTTx = async (
  tx: CotaNFTTransactionRequest,
  config?: SignConfig
): Promise<CKBTransaction> => {
  config = {
    ...internalDappConfig,
    ...config,
  }

  if (!config.popup) {
    config.popup = openPopup('')

    if (!config.popup) {
      return createBlockDialog(async () => signCotaNFTTx(tx, config))
    }
  }

  const { popup, timeoutInSeconds, ...dappConfig } = config

  config.popup.location.href = generateSignURL(
    {
      ...dappConfig,
      tx,
      signerAddress: tx.from,
      redirectURL: location.href,
    },
    false
  )

  const res = await runPopup({
    timeoutInSeconds: timeoutInSeconds ?? 5000,
    popup,
    type: DappRequestType.SignCotaNFT,
  })

  return res.tx
}

export const signRawTransaction = async (
  tx: CKBTransaction,
  signerAddress: string,
  config?: SignConfig
): Promise<SignCkbTxResponseData['tx']> => {
  config = {
    ...tx,
    ...internalDappConfig,
    ...config,
  }

  if (config.witnessIndex && config.witnessLastIndex) {
    if (config.witnessLastIndex < config.witnessIndex) {
      throw new Error(
        'The witnessLastIndex must not be smaller than the witnessIndex'
      )
    }
    if (config.witnessLastIndex >= tx.inputs.length) {
      throw new Error(
        'The witnessLastIndex must be smaller than the length of inputs'
      )
    }
  }

  if (!config.popup) {
    config.popup = openPopup('')

    if (!config.popup) {
      return createBlockDialog(async () =>
        signRawTransaction(tx, signerAddress, config)
      )
    }
  }

  const { popup, timeoutInSeconds, ...ckbDappConfig } = config

  config.popup.location.href = buildJoyIDURL(
    {
      ...ckbDappConfig,
      tx,
      signerAddress,
      redirectURL: location.href,
    },
    'popup',
    '/sign-ckb-raw-tx'
  )

  const res = await runPopup({
    timeoutInSeconds: timeoutInSeconds ?? 5000,
    popup,
    type: DappRequestType.SignCkbRawTx,
  })

  return res.tx
}

export const getSubkeyUnlock = async (
  aggregatorUrl: string,
  connection: AuthResponseData
): Promise<string> => {
  const pubkeyHash = append0x(blake160(append0x(connection.pubkey), 'hex'))
  const lock = addressToScript(connection.address)
  const req = {
    lock_script: serializeScript(lock),
    pubkey_hash: pubkeyHash,
    alg_index: 1, // secp256r1
  }
  const aggregator = new Aggregator(aggregatorUrl)
  const { unlock_entry: unlockEntry } =
    await aggregator.generateSubkeyUnlockSmt(req)
  return unlockEntry
}
