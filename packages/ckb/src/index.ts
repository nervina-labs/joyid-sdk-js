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
  type SignCkbTxResponseData,
  type AuthResponseData,
  type SignMessageResponseData,
  type SignCkbTxRequest,
  bufferToHex,
  append0x,
  remove0x,
} from '@joyid/common'
import * as ckbUtils from '@nervosnetwork/ckb-sdk-utils'
import { Aggregator } from './aggregator'
import { deserializeWitnessArgs } from './utils'

export * from './verify'

const {
  PERSONAL,
  addressToScript,
  blake160,
  blake2b,
  hexToBytes,
  toUint64Le,
  serializeScript,
  rawTransactionToHash,
  serializeWitnessArgs,
} = ckbUtils

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

// The witnessIndexes represents the positions of the JoyID cells in inputs, the default value is an empty array
// e.g. If the transaction inputs have two JoyID cells whose positions are 1 and 3(zero-based index), the witnessIndexes should be [1, 3]
export type SignConfig = CkbDappConfig &
  Pick<PopupConfigOptions, 'timeoutInSeconds' | 'popup'> & {
    witnessIndexes?: number[]
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
      typeof challenge === 'string' ? challenge : bufferToHex(challenge),
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

  const { witnessIndexes } = config

  if (Array.isArray(witnessIndexes)) {
    if (witnessIndexes.length === 0) {
      throw new Error('The witnessIndexes must be not empty')
    }
    if (witnessIndexes.length > tx.inputs.length) {
      throw new Error(
        'The length of witnessIndexes must not be bigger than the length of inputs'
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

const SECP256R1_PUBKEY_SIG_LEN = 129
// The witnessIndexes represents the positions of the JoyID cells in inputs, the default value is an array containing only 0
// e.g. If the transaction inputs have two JoyID cells whose positions are 1 and 3(zero-based index), the witnessIndexes should be [1, 3]
export const calculateChallenge = async (
  tx: CKBTransaction,
  witnessIndexes = [0]
): Promise<string> => {
  const { witnesses } = tx
  if (witnesses.length === 0) {
    throw new Error('Witnesses cannot be empty')
  }

  if (witnessIndexes.length === 0) {
    throw new Error('JoyID witnesses can not be empty')
  }

  const firstWitnessIndex = witnessIndexes[0] ?? 0
  if (typeof tx.witnesses[firstWitnessIndex] !== 'string') {
    throw new TypeError(
      'The first JoyID witness must be serialized hex string of WitnessArgs'
    )
  }
  const transactionHash = rawTransactionToHash(tx)
  const witnessArgs = deserializeWitnessArgs(tx.witnesses[firstWitnessIndex]!)

  const emptyWitness: CKBComponents.WitnessArgs = {
    ...witnessArgs,
    lock: `0x${'00'.repeat(SECP256R1_PUBKEY_SIG_LEN)}`,
  }

  console.log(console.log(emptyWitness))

  const serializedEmptyWitnessBytes = hexToBytes(
    serializeWitnessArgs(emptyWitness)
  )
  const serializedEmptyWitnessSize = serializedEmptyWitnessBytes.length

  const hasher = blake2b(32, null, null, PERSONAL)
  hasher.update(hexToBytes(transactionHash))
  hasher.update(
    hexToBytes(toUint64Le(`0x${serializedEmptyWitnessSize.toString(16)}`))
  )
  hasher.update(serializedEmptyWitnessBytes)

  for (const witnessIndex of witnessIndexes.slice(1)) {
    const witness = witnesses[witnessIndex]
    if (witness) {
      const bytes = hexToBytes(
        typeof witness === 'string' ? witness : serializeWitnessArgs(witness)
      )
      hasher.update(hexToBytes(toUint64Le(`0x${bytes.length.toString(16)}`)))
      hasher.update(bytes)
    }
  }

  if (witnesses.length > tx.inputs.length) {
    for (const witness of witnesses.slice(tx.inputs.length)) {
      const bytes = hexToBytes(
        typeof witness === 'string' ? witness : serializeWitnessArgs(witness)
      )
      hasher.update(hexToBytes(toUint64Le(`0x${bytes.length.toString(16)}`)))
      hasher.update(bytes)
    }
  }

  const challenge = `${hasher.digest('hex')}`
  return challenge
}

const WITNESS_NATIVE_MODE = '01'
const WITNESS_SUBKEY_MODE = '02'
// The witnessIndexes represents the positions of the JoyID cells in inputs, the default value is an array containing only 0
// e.g. If the transaction inputs have two JoyID cells whose positions are 1 and 3(zero-based index), the witnessIndexes should be [1, 3]
export const buildSignedTx = (
  unsignedTx: CKBTransaction,
  signedData: SignMessageResponseData,
  witnessIndexes = [0]
): CKBTransaction => {
  if (unsignedTx.witnesses.length === 0) {
    throw new Error('Witnesses length error')
  }
  const firstWitnessIndex = witnessIndexes[0] ?? 0
  const firstWitness = unsignedTx.witnesses[firstWitnessIndex]!
  const witnessArgs = deserializeWitnessArgs(firstWitness)

  const { message, signature, pubkey, keyType } = signedData

  const mode = keyType === 'sub_key' ? WITNESS_SUBKEY_MODE : WITNESS_NATIVE_MODE
  witnessArgs.lock = `0x${mode}${pubkey}${signature}${message}`

  const signedWitness = append0x(serializeWitnessArgs(witnessArgs))

  const signedTx = unsignedTx
  signedTx.witnesses[firstWitnessIndex] = signedWitness

  return signedTx
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

export {
  type AuthRequest,
  type AuthResponse,
  type SignMessageResponse,
  type SignMessageRequest,
  type CredentialKeyType,
  SigningAlg,
  type CkbDappConfig,
  openPopup,
  type PopupConfigOptions as PopupConifg,
  type AuthResponseData as ConnectResponseData,
  type SignMessageResponseData as SignChallengeResponseData,
  type CotaNFTTransactionRequest,
  type SignCotaNFTRequest,
  type SignCkbTxRequest,
  type CKBTransaction,
} from '@joyid/common'
export {
  getJoyIDCellDep,
  getCotaTypeScript,
  getJoyIDLockScript,
  getCotaCellDep,
} from './constants'

export { Aggregator } from './aggregator'
