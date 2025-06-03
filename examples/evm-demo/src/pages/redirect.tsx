import { type Component, Match, Switch } from 'solid-js'
import { Navigate, useSearchParams } from '@solidjs/router'
import {
  signMessageCallback,
  signTransactionCallback,
  connectCallback,
  signTypedDataCallback,
} from '@joyid/evm'
import { type RedirectAction } from '../utils'

export const Redirect: Component = () => {
  const [search] = useSearchParams<Record<'action', RedirectAction>>()

  // Helper to build URL with campaign/card_id from localStorage
  function buildUrl(base: string) {
    const campaign = localStorage.getItem('campaign') || ''
    const cardId = localStorage.getItem('card_id') || ''
    const params = []
    if (campaign) params.push(`campaign=${encodeURIComponent(campaign)}`)
    if (cardId) params.push(`card_id=${encodeURIComponent(cardId)}`)
    return params.length ? `${base}?${params.join('&')}` : base
  }

  const redirectHome = () => {
    let state
    try {
      state = connectCallback()
    } catch (error) {
      //
    }
    return <Navigate href={buildUrl('/home')} state={state} />
  }
  const redirectSend = () => {
    let state
    try {
      state = signTransactionCallback()
    } catch (error) {
      //
    }
    return <Navigate href={buildUrl('/send')} state={state} />
  }
  const redirectSendErc20 = () => {
    let state
    try {
      state = signTransactionCallback()
    } catch (error) {
      //
    }
    return <Navigate href={buildUrl('/send-erc20')} state={state} />
  }
  const redirectSignMessage = () => {
    let state
    try {
      state = signMessageCallback()
    } catch (error: any) {
      if (error.state) {
        state = { state: error.state }
      }
    }
    return <Navigate href={buildUrl('/sign-message')} state={state} />
  }
  const redirectSignTypedData = () => {
    let state
    try {
      state = signTypedDataCallback()
    } catch (error) {
      //
    }
    return <Navigate href={buildUrl('/sign-typed-data')} state={state} />
  }

  return (
    <Switch fallback={<Navigate href="/" />}>
      <Match when={search.action === 'connect'}>{redirectHome()}</Match>
      <Match when={search.action === 'send'}>{redirectSend()}</Match>
      <Match when={search.action === 'send-erc20'}>{redirectSendErc20()}</Match>
      <Match when={search.action === 'sign-typed-data'}>
        {redirectSignTypedData()}
      </Match>
      <Match when={search.action === 'sign-message'}>
        {redirectSignMessage()}
      </Match>
    </Switch>
  )
}