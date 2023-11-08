/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import type {
  AuthResponseData,
  DappRequestType,
  SignCkbTxResponseData,
  SignCotaNFTResponseData,
  SignEvmTxResponseData,
  SignMessageResponseData,
} from '../types/dapp'
import type { SignNostrEventData } from '../types/nostr'
import { getConfig } from './config'
import {
  PopupCancelledError,
  // PopupNotSupportedError,
  PopupTimeoutError,
} from './errors'

export interface PopupConfigOptions<
  T extends DappRequestType = DappRequestType.Auth,
> {
  /**
   * The number of seconds to wait for a popup response before
   * throwing a timeout error. Defaults to 300s
   */
  timeoutInSeconds?: number

  /**
   * Accepts an already-created popup window to use. If not specified, the SDK
   * will create its own. This may be useful for platforms like iOS that have
   * security restrictions around when popups can be invoked (e.g. from a user click event)
   */
  popup?: any

  type: T
}

const DEFAULT_AUTHORIZE_TIMEOUT_IN_SECONDS = 3000

export const openPopup = (url: string = ''): Window | null => {
  const width = 400
  const height = 600
  const left = window.screenX + (window.innerWidth - width) / 2
  const top = window.screenY + (window.innerHeight - height) / 2

  return window.open(
    url,
    'joyid:authorize:popup',
    `left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`
  )
}

interface PopupRerurnType {
  [DappRequestType.Auth]: AuthResponseData
  [DappRequestType.SignMessage]: SignMessageResponseData
  [DappRequestType.SignEvm]: SignEvmTxResponseData
  [DappRequestType.SignCkbTx]: SignCkbTxResponseData
  [DappRequestType.SignCotaNFT]: SignCotaNFTResponseData
  [DappRequestType.SignNostrEvent]: SignNostrEventData
  [DappRequestType.EncryptNostrMessage]: any
  [DappRequestType.DecryptNostrMessage]: any
}

export const runPopup = async <T extends DappRequestType>(
  config: PopupConfigOptions<T>
): Promise<PopupRerurnType[T]> =>
  await new Promise<PopupRerurnType[T]>((resolve, reject) => {
    // todo: fix me
    // if (isStandaloneBrowser()) {
    //   reject(new PopupNotSupportedError(config.popup))
    // }
    // eslint-disable-next-line prefer-const
    let popupEventListener: (e: MessageEvent) => void
    // eslint-disable-next-line prefer-const
    let timeoutId: undefined | ReturnType<typeof setTimeout>
    // Check each second if the popup is closed triggering a PopupCancelledError
    const popupTimer = setInterval(() => {
      if (config.popup?.closed) {
        clearInterval(popupTimer)
        clearTimeout(timeoutId)
        window.removeEventListener('message', popupEventListener, false)
        reject(new PopupCancelledError(config.popup))
      }
    }, 1000)

    timeoutId = setTimeout(
      () => {
        clearInterval(popupTimer)
        reject(new PopupTimeoutError(config.popup))
        window.removeEventListener('message', popupEventListener, false)
      },
      (config.timeoutInSeconds ?? DEFAULT_AUTHORIZE_TIMEOUT_IN_SECONDS) * 1000
    )

    popupEventListener = (e: MessageEvent) => {
      const { joyidAppURL } = getConfig()
      if (joyidAppURL == null) {
        reject(new Error('JoyID app url is not set'))
        return
      }
      const appURL = new URL(joyidAppURL)
      if (e.origin !== appURL.origin) {
        return
      }
      if (!e.data || e.data?.type !== config.type) {
        return
      }

      clearTimeout(timeoutId)
      clearInterval(popupTimer)
      window.removeEventListener('message', popupEventListener, false)
      config.popup.close()
      if (e.data.error) {
        reject(new Error(e.data.error))
      }
      resolve(e.data.data)
    }

    window.addEventListener('message', popupEventListener)
  })
