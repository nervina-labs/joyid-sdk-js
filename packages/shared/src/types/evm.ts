import { type RequireAllOrNone } from 'type-fest'
import { type TypedData } from 'abitype'
import { type DappCommunicationType } from './dapp'

export type Hex = `0x${string}`
export type EthAddress = `0x${string}`

export type AccessList = Array<{ address: EthAddress; storageKeys: Hex[] }>

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

export interface Network {
  name: string
  chainId: number
}

export interface JoyIDConfig {
  joyidAppURL?: string
  joyidServerURL?: string
}

export type EthNetworkConfig = RequireAllOrNone<
  { rpcURL?: string; network?: Network },
  'network' | 'rpcURL'
>

export interface DappConfig extends JoyIDConfig {
  // name of your app
  name?: string
  // logo of your app
  logo?: string
  // custom state that will be returned to your app after authentication
  state?: unknown
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
