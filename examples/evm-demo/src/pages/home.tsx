/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Component,
  For,
  Match,
  Show,
  Switch,
  batch,
  createSignal,
  onMount,
} from 'solid-js'
import { writeClipboard } from '@solid-primitives/clipboard'
import { A, Navigate, useLocation } from '@solidjs/router'
import toast from 'solid-toast'
import { useAuthData, useLogout } from '../hooks/localStorage'
import { truncateMiddle } from '../utils'
import { createQuery } from '@tanstack/solid-query'
import { formatEther } from 'ethers/lib/utils'
import { useProvider } from '../hooks/provider'
import { Chains } from '../chains'
import { produce } from 'solid-js/store'
import { connectCallback } from '@joyid/evm'

export const Home: Component = () => {
  const location = useLocation<ReturnType<typeof connectCallback>>()
  const logout = useLogout()
  const { authData, setAuthData } = useAuthData()
  onMount(() => {
    if (location.state) {
      setAuthData(
        produce((data) => {
          data.ethAddress = location.state!.address!
        })
      )
    }
  })
  const [selectedChain, setSelectedChain] = createSignal(authData.name)
  const provider = useProvider()
  const queryAXON = createQuery(
    () => ['balance', authData.ethAddress, authData.chainId],
    () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return provider()?.getBalance(authData.ethAddress)
    },
    {
      retry: 3,
      enabled: !!authData.ethAddress && !!provider(),
    }
  )

  return (
    <Show when={authData.ethAddress} fallback={<Navigate href="/" />}>
      <section class="flex-col flex items-center">
        <select
          class="select select-black select-bordered w-full max-w-xs"
          value={selectedChain()}
          onChange={(e) => {
            const val = e.currentTarget.value
            setSelectedChain(val)
            const chain = Chains[val]
            batch(() => {
              for (const key in chain) {
                if (Object.prototype.hasOwnProperty.call(chain, key)) {
                  const k = key as keyof typeof chain
                  setAuthData(k, chain[k])
                }
              }
            })
          }}
        >
          <For each={Object.keys(Chains)}>
            {(chainName) => {
              const chain = Chains[chainName]
              return <option value={chain.name}>{chain.name}</option>
            }}
          </For>
        </select>
        <div class="stat">
          <div class="stat-title">EVM Account</div>
          <div class="stat-value">{truncateMiddle(authData.ethAddress)}</div>
          <div class="stat-actions mt-2">
            <button
              class="btn btn-xs btn-success btn-outline"
              onClick={() => {
                writeClipboard(authData.ethAddress)
                toast.success('Copied Successfully', {
                  position: 'bottom-center',
                })
              }}
            >
              Copy Address
            </button>
          </div>
          <div class="stat-desc mt-2 text-md">
            <a class="link" href={authData.faucet} target="_blank">
              Claim
            </a>
          </div>
          <div class="stat-desc mt-2 text-lg">
            <Switch>
              <Match when={queryAXON.isLoading}>...</Match>
              <Match when={queryAXON.isSuccess}>
                {`${formatEther(queryAXON.data!.toString())} ${authData.unit}`}
              </Match>
            </Switch>
          </div>
          {/* <div class="stat-desc">↗︎ 400 (22%)</div> */}
        </div>
        <A href="/sign-message">
          <button class="btn btn-wide mt-8">Sign Message</button>
        </A>
        <A href="/sign-typed-data">
          <button class="btn btn-wide mt-8">Sign Typed Data</button>
        </A>
        <A href="/send">
          <button class="btn btn-wide mt-8">Send {authData.unit}</button>
        </A>
        <A href="/send-erc20">
          <button class="btn btn-wide mt-8">Send ERC20</button>
        </A>
        <a
          href="https://github.com/nervina-labs/joyid-evm-demo"
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
