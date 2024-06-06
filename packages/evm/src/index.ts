import type {
  SignEvmTxRequest,
  SignEvmTxResponseData,
  TransactionRequest,
  SignTypedDataRequest,
  EvmConfig,
  PopupConfigOptions,
  TypedData,
} from '@joyid/common'
import {
  DappRequestType,
  getRedirectResponse,
  internalConfig,
  buildJoyIDURL,
  signMessageWithPopup,
  signMessageWithRedirect as signWithRedirect,
  signMessageCallback as signCallback,
  buildJoyIDSignMessageURL,
  authCallback,
  authWithPopup,
  authWithRedirect,
  buildJoyIDAuthURL,
  openPopup,
  runPopup,
  createBlockDialog,
  bufferToHex,
  safeExec,
} from '@joyid/common'

export type { EvmConfig, TransactionRequest, PopupConfigOptions as PopupConifg }

const JOYID_STORAGE_KEY = 'joyid:ethereum::address'

export const buildSignTxURL = (
  config: SignEvmTxRequest,
  type: 'popup' | 'redirect' = 'popup'
): string =>
  buildJoyIDURL(
    {
      ...internalConfig,
      ...config,
    },
    type,
    '/sign-evm'
  )

export const buildSignTypedDataUrl = (
  config: SignTypedDataRequest,
  type: 'popup' | 'redirect' = 'popup'
): string =>
  buildJoyIDURL(
    {
      ...internalConfig,
      ...config,
    },
    type,
    '/sign-typed-data'
  )

export const buildConnectUrl = (
  config: EvmConfig & { redirectURL: string }
): string =>
  buildJoyIDAuthURL(
    {
      ...internalConfig,
      ...config,
      requestNetwork: 'ethereum',
    },
    'redirect'
  )

export const buildSignMessageUrl = (
  message: string | Uint8Array,
  config: EvmConfig & { redirectURL: string; address: string },
  type: 'popup' | 'redirect' = 'popup'
): string => {
  const isData = typeof message !== 'string'
  return buildJoyIDSignMessageURL(
    {
      ...internalConfig,
      ...config,
      requestNetwork: 'ethereum',
      challenge: typeof message !== 'string' ? bufferToHex(message) : message,
      isData,
    },
    type
  )
}

export const initConfig = (config?: EvmConfig): EvmConfig => {
  Object.assign(internalConfig, config)
  return internalConfig as EvmConfig
}

export const getConfig = (): EvmConfig => internalConfig

export type SignConfig = EvmConfig &
  Pick<PopupConfigOptions, 'timeoutInSeconds' | 'popup'>

type Hex = `0x${string}`

type Address = Hex

export const connect = async (config?: SignConfig): Promise<Address> => {
  // eslint-disable-next-line no-param-reassign
  config = {
    ...internalConfig,
    ...config,
  }
  const res = await authWithPopup({
    redirectURL: location.href,
    requestNetwork: 'ethereum',
    ...config,
  })
  safeExec(() => {
    localStorage.setItem(JOYID_STORAGE_KEY, res.ethAddress)
  })
  return res.ethAddress as Address
}

export const disconnect = (): void => {
  safeExec(() => {
    localStorage.removeItem(JOYID_STORAGE_KEY)
  })
}

export const getConnectedAddress = (): Address | null =>
  safeExec(() => localStorage.getItem(JOYID_STORAGE_KEY) as Address) ?? null

const ensureSignerAddress = (signerAddress?: string): string => {
  let address = signerAddress
  if (address == null) {
    const connected = getConnectedAddress()
    if (connected != null) {
      address = connected
    }
  }
  if (address == null) {
    throw new Error('signerAddress is required')
  }
  return address
}

export const connectWithRedirect = (
  redirectURL: string,
  config?: EvmConfig
): void => {
  // eslint-disable-next-line no-param-reassign
  config = {
    ...internalConfig,
    ...config,
  }
  authWithRedirect({
    redirectURL,
    requestNetwork: 'ethereum',
    ...config,
  })
}

interface WithState {
  state?: string
}

export const connectCallback = (
  uri?: string
): WithState & { address: string } => {
  const { state, ethAddress: address } = authCallback(uri)
  safeExec(() => {
    localStorage.setItem(JOYID_STORAGE_KEY, address)
  })
  if (state != null) {
    return {
      state,
      address,
    }
  }
  return {
    address,
  }
}

export const signMessage = async (
  message: string | Uint8Array,
  signerAddress?: string,
  config?: SignConfig
): Promise<Hex> => {
  const isData = typeof message !== 'string'
  // eslint-disable-next-line no-param-reassign
  config = {
    ...internalConfig,
    ...config,
  }
  signerAddress = ensureSignerAddress(signerAddress)

  const res = await signMessageWithPopup({
    requestNetwork: 'ethereum',
    challenge: typeof message !== 'string' ? bufferToHex(message) : message,
    isData,
    address: signerAddress,
    redirectURL: location.href,
    ...config,
  })
  return res.signature as Hex
}

export const signMessageWithRedirect = (
  redirectURL: string,
  message: string | Uint8Array,
  signerAddress?: string,
  config?: EvmConfig
): void => {
  const isData = typeof message !== 'string'
  // eslint-disable-next-line no-param-reassign
  config = {
    ...internalConfig,
    ...config,
  }

  signerAddress = ensureSignerAddress(signerAddress)

  signWithRedirect({
    requestNetwork: 'ethereum',
    challenge: typeof message !== 'string' ? bufferToHex(message) : message,
    isData,
    address: signerAddress,
    redirectURL,
    ...config,
  })
}

export const signMessageCallback = (
  uri?: string
): WithState & { signature: string } => {
  const { signature, state } = signCallback(uri)
  if (state != null) {
    return {
      state,
      signature,
    }
  }
  return {
    signature,
  }
}

/**
 *
 * @param typedData
 * see: https://viem.sh/docs/actions/wallet/signTypedData.html#domain
 * ```ts
 * signTypedData({
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    types: {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  })
 * ```
 * @returns `0x${string}`
 */
export const signTypedData = async (
  typedData: TypedData,
  signerAddress?: string,
  config?: SignConfig
): Promise<Hex> => {
  // eslint-disable-next-line no-param-reassign
  config = {
    ...internalConfig,
    ...config,
  }

  signerAddress = ensureSignerAddress(signerAddress)

  if (config.popup == null) {
    config.popup = openPopup('')

    if (config.popup == null) {
      return await createBlockDialog(
        async () => await signTypedData(typedData, signerAddress, config)
      )
    }
  }

  const { popup, timeoutInSeconds, ...dappConfig } = config

  config.popup.location.href = buildSignTypedDataUrl({
    ...dappConfig,
    typedData,
    signerAddress,
    redirectURL: location.href,
  })

  const res = await runPopup({
    timeoutInSeconds: timeoutInSeconds ?? 5000,
    popup,
    type: DappRequestType.SignMessage,
  })

  return res.signature as Hex
}

export const signTypedDataWithRedirect = (
  redirectURL: string,
  typedData: TypedData,
  signerAddress: string,
  config?: EvmConfig
): void => {
  // eslint-disable-next-line no-param-reassign
  config = {
    ...internalConfig,
    ...config,
  }

  const url = buildSignTypedDataUrl(
    {
      ...config,
      typedData,
      signerAddress,
      redirectURL,
    },
    'redirect'
  )

  window.location.assign(url)
}

export const signTypedDataCallback = signMessageCallback

const signTxWithPopupBase = async (
  tx: TransactionRequest,
  signerAddress?: string,
  config?: SignConfig,
  isSend?: boolean
): Promise<Hex> => {
  const signer = signerAddress ?? tx.from ?? getConnectedAddress()
  if (signer == null) {
    throw new Error('signerAddress or tx.from is required')
  }
  // eslint-disable-next-line no-param-reassign
  config = {
    ...internalConfig,
    ...config,
  }

  if (config.popup == null) {
    config.popup = openPopup('')

    if (config.popup == null) {
      return await createBlockDialog(
        async () => await signTxWithPopupBase(tx, signer, config, isSend)
      )
    }
  }

  const { popup, timeoutInSeconds, ...dappConfig } = config

  config.popup.location.href = buildSignTxURL({
    ...dappConfig,
    tx,
    signerAddress: signer,
    redirectURL: location.href,
    isSend,
  })

  const res = await runPopup({
    timeoutInSeconds: timeoutInSeconds ?? 5000,
    popup,
    type: DappRequestType.SignEvm,
  })

  return res.tx
}

export const signTransaction = async (
  tx: TransactionRequest,
  signerAddress?: string,
  config?: SignConfig
): Promise<Hex> => await signTxWithPopupBase(tx, signerAddress, config, false)

export const sendTransaction = async (
  tx: TransactionRequest,
  signerAddress?: string,
  config?: SignConfig
): Promise<Hex> => await signTxWithPopupBase(tx, signerAddress, config, true)

export const signTransactionRedirectBase = (
  redirectURL: string,
  tx: TransactionRequest,
  signerAddress?: string,
  config?: EvmConfig,
  isSend?: boolean
): void => {
  const signer = signerAddress ?? tx.from ?? getConnectedAddress()
  if (signer == null) {
    throw new Error('signerAddress or tx.from is required')
  }

  // eslint-disable-next-line no-param-reassign
  config = {
    ...internalConfig,
    ...config,
  }

  const url = buildSignTxURL(
    {
      ...config,
      tx,
      signerAddress: signer,
      redirectURL,
      isSend,
    },
    'redirect'
  )

  window.location.assign(url)
}

export const signTransactionWithRedirect = (
  redirectURL: string,
  tx: TransactionRequest,
  signerAddress?: string,
  config?: EvmConfig
): void => {
  signTransactionRedirectBase(redirectURL, tx, signerAddress, config, false)
}

export const sendTransactionWithRedirect = (
  redirectURL: string,
  tx: TransactionRequest,
  signerAddress?: string,
  config?: EvmConfig
): void => {
  signTransactionRedirectBase(redirectURL, tx, signerAddress, config, true)
}

export const signTransactionCallback = (
  uri?: string
): WithState & { tx: Hex } => {
  const { tx, state } = getRedirectResponse<SignEvmTxResponseData>(uri)
  if (state != null) {
    return {
      state,
      tx,
    }
  }
  return {
    tx,
  }
}

export const sendTransactionCallback = signTransactionCallback
