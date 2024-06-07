/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, Match, Show, Switch, onMount } from 'solid-js'
import { writeClipboard } from '@solid-primitives/clipboard'
import { A, Navigate, useLocation } from '@solidjs/router'
import toast from 'solid-toast'
import { useAuthData, useLogout } from '../hooks/localStorage'
import { truncateMiddle } from '../utils'
import { createQuery } from '@tanstack/solid-query'
import { produce } from 'solid-js/store'
import { btcService } from '../hooks/service'
import { MIN_UTXO_AMOUNT } from '../env'
// import { requestAccounts, getPublicKey } from '@joyid/bitcoin'

export const Home: Component = () => {
  const location = useLocation<ReturnType<any>>()
  const logout = useLogout()
  const { authData, setAuthData } = useAuthData()
  onMount(() => {
    if (location.state) {
      setAuthData(
        produce((data) => {
          data.address = location.state!.address!
          data.pubkey = location.state!.pubkey!
        })
      )
    }
  })
  // const provider = useProvider()
  const queryBalance = createQuery(
    () => ['balance', authData.address],
    () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return btcService.getBtcBalance(authData.address, {
        min_satoshi: MIN_UTXO_AMOUNT,
      })
      // return provider()?.getBalance(authData.address)
    },
    {
      retry: 3,
      enabled: !!authData.address,
    }
  )

  return (
    <Show when={authData.address} fallback={<Navigate href="/" />}>
      <section class="flex-col flex items-center">
        <div class="stat">
          <div class="stat-title">Bitcoin Account</div>
          <div class="stat-value">{truncateMiddle(authData.address)}</div>
          <div class="stat-desc mt-2">{`Pubkey: ${truncateMiddle(
            authData.pubkey
          )}`}</div>
          <div class="stat-actions mt-2">
            <button
              class="btn btn-xs btn-success btn-outline mr-2"
              onClick={() => {
                writeClipboard(authData.address)
                toast.success('Copied Successfully', {
                  position: 'bottom-center',
                })
              }}
            >
              Copy Address
            </button>
            <button
              class="btn btn-xs btn-success btn-outline"
              onClick={() => {
                writeClipboard(authData.pubkey)
                toast.success('Copied Successfully', {
                  position: 'bottom-center',
                })
              }}
            >
              Copy Pubkey
            </button>
          </div>
          <div class="stat-desc mt-2 text-lg">
            <Switch>
              <Match when={queryBalance.isLoading}>...</Match>
              <Match when={queryBalance.isSuccess && queryBalance.data != null}>
                {`${Number(queryBalance.data?.satoshi) / 10 ** 8} BTC`}
              </Match>
            </Switch>
          </div>
        </div>
        <A href="/sign-message">
          <button class="btn btn-wide mt-8">Sign Message</button>
        </A>
        <A href="/send">
          <button class="btn btn-wide mt-8">Sign TX</button>
        </A>
        <a
          href="https://github.com/nervina-labs/joyid-bitcoin-demo"
          target="_blank"
        >
          <button class="btn btn-wide mt-8 btn-info btn-outline">GitHub</button>
        </a>
        <button
          class="btn btn-wide btn-outline mt-8"
          onClick={() => {
            logout()
          }}
        >
          Logout
        </button>
      </section>
    </Show>
  )
}
