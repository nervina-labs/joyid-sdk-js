import {
  type DappCommunicationType,
  type MiniAppBaseRequest,
  type DappConfig,
} from './dapp'
import { type TypedData } from 'abitype'

export type Hex = `0x${string}`
export type EthAddress = `0x${string}`

export type AccessList = Array<{
  address: EthAddress
  storageKeys: Hex[]
}>

export type { TypedData }

export interface TransactionRequest {
  // type?: number
  maxPriorityFeePerGas?: string
  maxFeePerGas?: string

  to?: string
  from?: string
  nonce?: number

  gasLimit?: string
  gasPrice?: string

  data?: string
  value?: string
  chainId?: number

  accessList?: AccessList

  customData?: Record<string, any>
  ccipReadEnabled?: boolean
}

export interface EvmChainParameter {
  chainId: number
  /** The chain name. */
  name: string
  /** Native currency for the chain. */
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: readonly string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[]
}

export type Network =
  | {
      name: string
      chainId: number
    }
  | EvmChainParameter

export interface EthNetworkConfig {
  network?: Network
  /* @deprecated
    `rpcURL` is deprecated, please use network instead
  */
  rpcURL?: string
}

export type EvmConfig = EthNetworkConfig & DappConfig

export type SignEvmTxRequest = EvmConfig & {
  tx: TransactionRequest
  isSend?: boolean
  signerAddress: string
  redirectURL: string
  commuType?: DappCommunicationType
}

export type SignTypedDataRequest = EvmConfig & {
  signerAddress: string
  redirectURL: string
  commuType?: DappCommunicationType
  typedData: TypedData
}

export type EvmWeb2LoginConfig = EvmConfig & {
  backgroundImage?: string
}

export type EvmWeb2LoginRequest = EvmWeb2LoginConfig & {
  signerAddress?: string
  redirectURL: string
  commuType?: DappCommunicationType
}

export interface EvmWeb2LoginResponse {
  uid: string
  entropy: string
}

export type MiniAppSignEvmTxRequest = EvmConfig &
  MiniAppBaseRequest & {
    tx: TransactionRequest
    signerAddress: string
    isSend?: boolean
  }

export type MiniAppSignTypedDataRequest = EvmConfig &
  MiniAppBaseRequest & {
    signerAddress: string
    typedData: TypedData
    isSend?: boolean
  }

export type AASignTypedDataParams = Omit<TypedData, 'privateKey'>

/**
 * A signer that can sign messages and typed data.
 *
 * @template Inner - the generic type of the inner client that the signer wraps to provide functionality such as signing, etc.
 *
 * @var signerType - the type of the signer (e.g. local, hardware, etc.)
 * @var inner - the inner client of @type {Inner}
 *
 * @method getAddress - get the address of the signer
 * @method signMessage - sign a message
 * @method signTypedData - sign typed data
 */
export interface SmartAccountSigner<Inner = any> {
  signerType: string
  inner: Inner

  getAddress: () => Promise<Hex>

  signMessage: (msg: Uint8Array | Hex | string) => Promise<Hex>

  signTypedData: (params: AASignTypedDataParams) => Promise<Hex>
}
