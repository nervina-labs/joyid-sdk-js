import { type Component, Show, createSignal } from 'solid-js'
import { Navigate, useNavigate } from '@solidjs/router'
import { useAuthData } from '../hooks/localStorage'
import {
  requestAccounts,
  getPublicKey,
  initConfig,
  buildConnectUrl,
} from '@joyid/bitcoin'
import { buildRedirectUrl } from '../utils'

export const Root: Component = () => {
  const [isLoading, setIsLoading] = createSignal(false)
  const navi = useNavigate()
  const { setAuthData, authData } = useAuthData()

  const onConenctPopup = async () => {
    setIsLoading(true)
    try {
      const [address] = await requestAccounts()
      const pubkey = getPublicKey()!
      setAuthData({
        address,
        pubkey,
        mode: 'popup',
      })
      navi('/home')
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onConnectRedirect = () => {
    setAuthData({ mode: 'redirect' })
    const redirectURL = buildRedirectUrl('connect')
    setAuthData({
      mode: 'redirect',
    })
    const url = buildConnectUrl(
      {
        requestAddressType: authData.addressType,
        redirectURL,
      },
      'redirect'
    )
    window.location.assign(url)
    // connectWithRedirect(url)
  }

  return (
    <Show when={!authData.address} fallback={<Navigate href="/home" />}>
      <section class="justify-center flex-col flex">
        <div class="form-control w-full max-w-xs mb-2">
          <label class="label">
            <span class="label-text">Address Type</span>
          </label>
          <select
            class="select select-primary w-full max-w-xs"
            value={authData.addressType || 'auto'}
            onChange={(e) => {
              const val = e.currentTarget.value as 'p2tr' | 'p2wpkh' | 'auto'
              setAuthData({
                addressType: val,
              })
              initConfig({
                requestAddressType: val,
              })
            }}>
            <option value="auto">Auto</option>
            <option value="p2tr">P2TR</option>
            <option value="p2wpkh">P2WPKH</option>
          </select>
        </div>
        <button
          class="btn btn-wide mt-8"
          classList={{ loading: isLoading() }}
          onClick={onConenctPopup}>
          Connect With Popup
        </button>
        <button class="btn btn-wide mt-8" onClick={onConnectRedirect}>
          Connect With Redirect
        </button>
      </section>
    </Show>
  )
}
