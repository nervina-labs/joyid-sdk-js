/* eslint-disable no-param-reassign */
import {
  DappRequestType,
  type SignMessageRequest,
  type SignMessageResponseData,
} from '../types/dapp'
import { buildJoyIDURL, getRedirectResponse } from './url'
import { type PopupConfigOptions, openPopup, runPopup } from './popup'
import { createBlockDialog } from './block-dialog'

export const buildJoyIDSignMessageURL = (
  request: SignMessageRequest,
  type: 'redirect' | 'popup'
): string => buildJoyIDURL(request, type, '/sign-message')

export const signMessageWithRedirect = (request: SignMessageRequest): void => {
  window.location.assign(buildJoyIDSignMessageURL(request, 'redirect'))
}

export const signMessageWithPopup = async <T extends DappRequestType>(
  request: SignMessageRequest,
  config?: Pick<PopupConfigOptions<T>, 'timeoutInSeconds' | 'popup'>
): Promise<SignMessageResponseData> => {
  config = config ?? {}

  if (config.popup == null) {
    config.popup = openPopup('')

    if (config.popup == null) {
      return await createBlockDialog(
        async () => await signMessageWithPopup(request, config)
      )
    }
  }

  config.popup.location.href = buildJoyIDSignMessageURL(request, 'popup')

  return await runPopup({
    ...config,
    type: DappRequestType.SignMessage,
  })
}

export const signMessageCallback = (uri?: string): SignMessageResponseData =>
  getRedirectResponse<SignMessageResponseData>(uri)
