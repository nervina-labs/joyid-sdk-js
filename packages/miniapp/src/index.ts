import type {
  MiniAppSignEvmTxRequest,
  MiniAppSignTypedDataRequest,
  MiniAppBaseRequest,
  MiniAppAuthRequest,
  MiniAppSignMessageRequest,
} from '@joyid/common'
import {
  EvmConfig,
  encodeSearch,
  internalConfig,
  bufferToHex,
} from '@joyid/common'

export const initConfig = (config?: EvmConfig) => {
  Object.assign(internalConfig, config)
  return internalConfig as EvmConfig
}

export const getConfig = (): EvmConfig => internalConfig

const buildJoyIDURL = <T extends MiniAppBaseRequest>(
  request: T,
  path: string
) => {
  const joyidURL = request.joyidAppURL ?? getConfig().joyidAppURL
  const url = new URL(`${joyidURL}`)
  url.pathname = path
  const data = encodeSearch(request)
  url.searchParams.set('_data_', data)
  return url.href
}

export const buildConnectUrl = (config: EvmConfig & MiniAppAuthRequest) =>
  buildJoyIDURL(
    {
      ...internalConfig,
      ...config,
      requestNetwork: 'ethereum',
    },
    '/auth-mini-app'
  )

export const buildCkbConnectUrl = (config: EvmConfig & MiniAppAuthRequest) =>
  buildJoyIDURL(
    {
      ...internalConfig,
      ...config,
      requestNetwork: 'nervos',
    },
    '/auth-mini-app'
  )

export const buildSignMessageUrl = (
  message: string | Uint8Array,
  config: EvmConfig & MiniAppSignMessageRequest
) => {
  const isData = typeof message !== 'string'
  return buildJoyIDURL(
    {
      ...internalConfig,
      ...config,
      requestNetwork: 'ethereum',
      challenge: typeof message === 'string' ? message : bufferToHex(message),
      isData,
    },
    '/sign-mini-app-msg'
  )
}

export const buildSignTxURL = (config: MiniAppSignEvmTxRequest): string =>
  buildJoyIDURL(
    {
      ...internalConfig,
      ...config,
    },
    '/sign-mini-app-evm'
  )

export const buildSignTypedDataUrl = (
  config: MiniAppSignTypedDataRequest
): string =>
  buildJoyIDURL(
    {
      ...internalConfig,
      ...config,
    },
    '/sign-mini-app-typed-data'
  )

export { type TransactionRequest, type EvmConfig } from '@joyid/common'
