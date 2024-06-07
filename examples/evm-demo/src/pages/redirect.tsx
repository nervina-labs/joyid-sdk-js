import { Component, Match, Switch } from 'solid-js'
import { Navigate, useSearchParams } from '@solidjs/router'
import {
  signMessageCallback,
  signTransactionCallback,
  connectCallback,
  signTypedDataCallback,
} from '@joyid/evm'
import { RedirectAction } from '../utils'

export const Redirect: Component = () => {
  const [search] = useSearchParams<Record<'action', RedirectAction>>()
  const redirectHome = () => {
    let state
    try {
      state = connectCallback()
    } catch (error) {
      //
    }
    return <Navigate href="/home" state={state} />
  }
  const redirectSend = () => {
    let state
    try {
      state = signTransactionCallback()
    } catch (error) {
      //
    }
    return <Navigate href="/send" state={state} />
  }
  const redirectSendErc20 = () => {
    let state
    try {
      state = signTransactionCallback()
    } catch (error) {
      //
    }
    return <Navigate href="/send-erc20" state={state} />
  }
  const redirectSignMessage = () => {
    let state
    try {
      state = signMessageCallback()
    } catch (error: any) {
      // get redirect state from error
      if (error.state) {
        state = {
          state: error.state,
        }
      }
      //
    }
    return <Navigate href="/sign-message" state={state} />
  }
  const redirectSignTypedData = () => {
    let state
    try {
      state = signTypedDataCallback()
    } catch (error) {
      //
    }
    return <Navigate href="/sign-typed-data" state={state} />
  }
  search
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
