import { DappCommunicationType, DappRequestType } from '../types/dapp'
import type { AuthRequest, AuthResponseData } from '../types/dapp'
import { buildJoyIDURL, getRedirectResponse } from './url'
import { type PopupConfigOptions, openPopup, runPopup } from './popup'
import { createBlockDialog } from './block-dialog'

export const buildJoyIDAuthURL = (
  request: AuthRequest,
  type: 'popup' | 'redirect'
): string => buildJoyIDURL(request, type, '/auth')

export const authWithRedirect = (request: AuthRequest): void => {
  window.location.assign(buildJoyIDAuthURL(request, 'redirect'))
}

export const authWithPopup = async (
  request: AuthRequest,
  config?: Pick<PopupConfigOptions, 'timeoutInSeconds' | 'popup'>
): Promise<AuthResponseData> => {
  config = config ?? {}

  if (config.popup == null) {
    config.popup = openPopup('')

    if (config.popup == null) {
      return createBlockDialog(async () => authWithPopup(request, config))
    }
  }

  config.popup.location.href = buildJoyIDAuthURL(
    request,
    DappCommunicationType.Popup
  )

  return runPopup({
    ...request,
    ...config,
    type: DappRequestType.Auth,
  })
}

export const authCallback = (uri?: string): AuthResponseData =>
  getRedirectResponse<AuthResponseData>(uri)
