/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-param-reassign */
import {
  createBlockDialog,
  openPopup as p,
  runPopup,
  authWithPopup,
  buildJoyIDAuthURL,
  authCallback,
  signMessageWithPopup,
  buildJoyIDSignMessageURL,
  signMessageCallback as signCallback,
  buildJoyIDURL,
  internalConfig,
  DappRequestType,
  getRedirectResponse,
  safeExec,
  type SignPsbtRequest,
  type SignPsbtOptions,
  type BtcConfig,
  type BtcSignMessageType,
  type BatchSignPsbtRequest,
  type RequestNetwork,
} from '@joyid/common'

export const openPopup = p

export type { BtcConfig }

const JOYID_STORAGE_KEY = 'joyid:bitcoin::account'

export const buildSignPsbtURL = (
  config: SignPsbtRequest,
  type: 'popup' | 'redirect' = 'popup'
): string =>
  buildJoyIDURL(
    {
      ...internalConfig,
      ...config,
    },
    type,
    '/sign-psbt'
  )

export const buildSignPsbtsURL = (
  config: BatchSignPsbtRequest,
  type: 'popup' | 'redirect' = 'popup'
): string =>
  buildJoyIDURL(
    {
      ...internalConfig,
      ...config,
    },
    type,
    '/batch-sign-psbt'
  )

const getRequestNetwork = (
  requestAddressType: BtcConfig['requestAddressType']
): RequestNetwork =>
  requestAddressType !== null
    ? (`btc-${requestAddressType}` as RequestNetwork)
    : 'btc-auto'

export const buildConnectUrl = (
  { requestAddressType, ...config }: BtcConfig & { redirectURL: string },
  type: 'popup' | 'redirect' = 'popup'
): string =>
  buildJoyIDAuthURL(
    {
      ...internalConfig,
      ...config,
      requestNetwork: getRequestNetwork(requestAddressType),
    },
    type
  )

export const buildSignMessageUrl = (
  {
    message,
    ...config
  }: BtcConfig & {
    message: string
    redirectURL: string
    address: string
    signMessageType?: BtcSignMessageType
  },
  type: 'popup' | 'redirect' = 'popup'
): string => {
  if (config.signMessageType == null) {
    config.signMessageType = 'ecdsa'
  }
  return buildJoyIDSignMessageURL(
    {
      ...internalConfig,
      ...config,
      requestNetwork: 'btc-p2tr',
      challenge: message,
    },
    type
  )
}

export const initConfig = (config?: BtcConfig): BtcConfig => {
  Object.assign(internalConfig, config)
  return internalConfig as BtcConfig
}

export const getConfig = (): BtcConfig => internalConfig

const connectedAccount = {
  address: null as string | null,
  pubkey: null as string | null,
}

export const requestAccounts = async (): Promise<string[]> => {
  const config = getConfig()
  const requestNetwork = getRequestNetwork(config.requestAddressType)
  const res = await authWithPopup({
    ...config,
    redirectURL: location.href,
    requestNetwork,
  })
  const account = (() => {
    if (requestNetwork === 'btc-auto') {
      return res.btcAddressType === 'p2wpkh' ? res.nativeSegwit : res.taproot
    }
    return requestNetwork === 'btc-p2wpkh' ? res.nativeSegwit : res.taproot
  })()
  connectedAccount.address = account.address
  connectedAccount.pubkey = account.pubkey
  safeExec(() => {
    localStorage.setItem(JOYID_STORAGE_KEY, JSON.stringify(connectedAccount))
  })
  return [connectedAccount.address]
}

export const getAccounts = (): string[] =>
  connectedAccount.address != null
    ? [connectedAccount.address]
    : safeExec(() => {
        const json = localStorage.getItem(JOYID_STORAGE_KEY)
        if (json) {
          const account = JSON.parse(json)
          if (account?.address) {
            return [account.address] as string[]
          }
        }
        return []
      }) ?? []

export const getPublicKey = (): string | null => {
  if (connectedAccount.pubkey) {
    return connectedAccount.pubkey
  }
  return safeExec(() => {
    const json = localStorage.getItem(JOYID_STORAGE_KEY)
    if (json) {
      const account = JSON.parse(json)
      if (account?.pubkey) {
        return account.pubkey as string
      }
    }
    return null
  })
}

const ensureSignerAddress = (signerAddress?: string): string => {
  let address = signerAddress
  if (!address) {
    const [connected] = getAccounts()
    if (connected) {
      address = connected
    }
  }
  if (!address) {
    throw new Error('signerAddress is required')
  }
  return address
}

export const signMessage = async (
  message: string,
  type?: BtcSignMessageType,
  signerAddress?: string
): Promise<string> => {
  const config = getConfig()
  signerAddress = ensureSignerAddress(signerAddress)

  const res = await signMessageWithPopup({
    requestNetwork: getRequestNetwork(config.requestAddressType),
    challenge: message,
    address: signerAddress,
    signMessageType: type ?? 'ecdsa',
    redirectURL: location.href,
    ...config,
  })
  return res.signature
}

type SignConfig = BtcConfig & { timeoutInSeconds?: number }

const signPsbtBase = async (
  psbt: string,
  options?: SignPsbtOptions,
  signerAddress?: string,
  isSend?: boolean
): Promise<string> => {
  const config = getConfig() as SignConfig
  signerAddress = ensureSignerAddress(signerAddress)

  const popup = openPopup('')

  if (!popup) {
    return createBlockDialog(async () =>
      signPsbtBase(psbt, options, signerAddress, isSend)
    )
  }

  const { timeoutInSeconds, ...dappConfig } = config

  popup.location.href = buildSignPsbtURL({
    ...dappConfig,
    signerAddress,
    redirectURL: location.href,
    options,
    isSend,
    tx: psbt,
  })

  const res = await runPopup({
    timeoutInSeconds: timeoutInSeconds ?? 5000,
    popup,
    type: DappRequestType.SignPsbt,
  })

  return res.tx
}

export const signPsbts = async (
  psbts: string[],
  options?: SignPsbtOptions[],
  signerAddress?: string
): Promise<string[]> => {
  const config = getConfig() as SignConfig
  signerAddress = ensureSignerAddress(signerAddress)

  const popup = openPopup('')

  if (!popup) {
    return createBlockDialog(async () =>
      signPsbts(psbts, options, signerAddress)
    )
  }

  const { timeoutInSeconds, ...dappConfig } = config

  popup.location.href = buildSignPsbtsURL({
    ...dappConfig,
    signerAddress,
    redirectURL: location.href,
    options,
    psbts,
  })

  const res = await runPopup({
    timeoutInSeconds: timeoutInSeconds ?? 5000,
    popup,
    type: DappRequestType.BatchSignPsbt,
  })

  return res.psbts
}

export const signPsbt = async (
  psbt: string,
  options?: SignPsbtOptions,
  signerAddress?: string
): Promise<string> => signPsbtBase(psbt, options, signerAddress, false)

export const sendPsbt = async (
  psbt: string,
  options?: SignPsbtOptions,
  signerAddress?: string
): Promise<string> => signPsbtBase(psbt, options, signerAddress, true)

interface WithState {
  state?: any
}

export const connectCallback = (
  uri?: string,
  addressType?: 'p2tr' | 'p2wpkh' | 'auto'
): WithState & { address: string; pubkey: string } => {
  const { state, taproot, nativeSegwit, btcAddressType } = authCallback(uri)
  const config = getConfig()
  const account = (() => {
    const requestAddressType = addressType ?? config.requestAddressType
    if (requestAddressType === 'auto') {
      return btcAddressType === 'p2wpkh' ? nativeSegwit : taproot
    }
    return requestAddressType === 'p2wpkh' ? nativeSegwit : taproot
  })()

  safeExec(() => {
    localStorage.setItem(JOYID_STORAGE_KEY, JSON.stringify(account))
  })
  if (state) {
    return {
      state,
      ...account,
    }
  }
  return account
}

export const signMessageCallback = (
  uri?: string
): WithState & { signature: string } => {
  const { signature, state } = signCallback(uri)
  if (state) {
    return {
      state,
      signature,
    }
  }
  return {
    signature,
  }
}

export const signPsbtCallback = (uri?: string): WithState & { tx: string } => {
  const { tx, state } = getRedirectResponse<{ tx: string; state?: any }>(uri)
  if (state) {
    return {
      state,
      tx,
    }
  }
  return {
    tx,
  }
}
