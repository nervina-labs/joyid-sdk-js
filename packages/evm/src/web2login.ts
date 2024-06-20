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
} from '@joyid/common'

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
