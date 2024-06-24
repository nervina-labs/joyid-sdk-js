import {
  DappCommunicationType,
  type EvmWeb2LoginConfig,
  DappRequestType,
  type EvmWeb2LoginResponse,
  type PopupConfigOptions,
  createBlockDialog,
  buildJoyIDURL,
  openPopup,
  runPopup,
  internalConfig,
  getRedirectResponse,
} from '@joyid/common'

interface WithState {
  state?: string
}

export const initConfig = (config?: EvmWeb2LoginConfig): EvmWeb2LoginConfig => {
  Object.assign(internalConfig, config)
  return internalConfig as EvmWeb2LoginConfig
}

export const getConfig = (): EvmWeb2LoginConfig => internalConfig

export const connect = async (
  uid?: string,
  config?: Pick<
    PopupConfigOptions<DappRequestType.EvmWeb2Login>,
    'timeoutInSeconds' | 'popup'
  >
): Promise<EvmWeb2LoginResponse> => {
  config = config ?? {}
  const request = {
    signerAddress: uid,
    redirectURL: window.location.href,
    requestNetwork: 'ethereum',
    requestType: DappRequestType.EvmWeb2Login,
    ...internalConfig,
  }

  if (config.popup == null) {
    config.popup = openPopup('')

    if (config.popup == null) {
      return createBlockDialog(async () => connect(uid, config))
    }
  }

  config.popup.location.href = buildJoyIDURL(
    request,
    DappCommunicationType.Popup,
    '/evm-web2-login'
  )

  return runPopup({
    ...config,
    type: DappRequestType.EvmWeb2Login,
  })
}

export const connectWithRedirect = (
  redirectURL: string,
  uid?: string,
  config?: EvmWeb2LoginConfig
): void => {
  const request = {
    signerAddress: uid,
    redirectURL: redirectURL,
    requestNetwork: 'ethereum',
    requestType: DappRequestType.EvmWeb2Login,
    ...internalConfig,
    ...config,
  }

  window.location.assign(
    buildJoyIDURL(request, DappCommunicationType.Redirect, '/evm-web2-login')
  )
}

export const connectCallback = (
  uri?: string
): EvmWeb2LoginResponse & WithState => {
  const { state, uid, entropy } = getRedirectResponse<
    EvmWeb2LoginResponse & WithState
  >(uri)
  if (state != null) {
    return {
      state,
      uid,
      entropy,
    }
  }
  return {
    uid,
    entropy,
  }
}
