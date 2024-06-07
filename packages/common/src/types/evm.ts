/* eslint-disable @typescript-eslint/ban-types */
import {
  type DappCommunicationType,
  type MiniAppBaseRequest,
  type DappConfig,
} from './dapp'
import {
  type TypedData,
  type TypedDataDomain,
  type TypedDataToPrimitiveTypes,
} from 'abitype'

export type Hex = `0x${string}`
export type EthAddress = `0x${string}`

export type AccessList = Array<{
  address: EthAddress
  storageKeys: Hex[]
}>

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
  typedData: TypedDataDefinition
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

export type AASignTypedDataParams = Omit<TypedDataDefinition, 'privateKey'>

/**
 * @description Combines members of an intersection into a readable type.
 *
 * @see {@link https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=NdpAcmEFXY01xkqU3KO0Mg}
 * @example
 * Prettify<{ a: string } & { b: string } & { c: number, d: bigint }>
 * => { a: string, b: string, c: number, d: bigint }
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type TypedDataDefinition<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  ///
  primaryTypes = typedData extends TypedData ? keyof typedData : string,
> = primaryType extends 'EIP712Domain'
  ? EIP712DomainDefinition<typedData, primaryType>
  : MessageDefinition<typedData, primaryType, primaryTypes>

type MessageDefinition<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData = keyof typedData,
  ///
  primaryTypes = typedData extends TypedData ? keyof typedData : string,
  schema extends Record<string, unknown> = typedData extends TypedData
    ? TypedDataToPrimitiveTypes<typedData>
    : Record<string, unknown>,
  message = schema[primaryType extends keyof schema
    ? primaryType
    : keyof schema],
> = {
  types: typedData
} & {
  primaryType:
    | primaryTypes // show all values
    | (primaryType extends primaryTypes ? primaryType : never) // infer value
  domain?:
    | (schema extends { EIP712Domain: infer domain }
        ? domain
        : Prettify<TypedDataDomain>)
    | undefined
  message: Record<string, any> extends message // Check if message was inferred
    ? Record<string, unknown>
    : message
}

type EIP712DomainDefinition<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends 'EIP712Domain' = 'EIP712Domain',
  ///
  schema extends Record<string, unknown> = typedData extends TypedData
    ? TypedDataToPrimitiveTypes<typedData>
    : Record<string, unknown>,
> = {
  types?: typedData | undefined
} & {
  primaryType: 'EIP712Domain' | primaryType
  domain: schema extends { EIP712Domain: infer domain }
    ? domain
    : Prettify<TypedDataDomain>
  message?: never | undefined
}

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
