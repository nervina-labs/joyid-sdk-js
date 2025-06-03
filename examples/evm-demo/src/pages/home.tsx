import {
  type Component,
  Show,
  onMount,
} from 'solid-js'
import { writeClipboard } from '@solid-primitives/clipboard'
import { Navigate, useLocation } from '@solidjs/router'
import toast from 'solid-toast'
import { useAuthData, useLogout } from '../hooks/localStorage'
import { truncateMiddle } from '../utils'
// import { createQuery } from '@tanstack/solid-query'
// import { formatEther } from 'ethers/lib/utils'
// import { useProvider } from '../hooks/provider'
// import { Chains } from '../chains'
// import { produce } from 'solid-js/store'
// import { type connectCallback } from '@joyid/evm'

// Placeholder for JWT generation hook
function useGenerateJWT() {
  // You can implement this later
  return () => {
    // TODO: Generate JWT here
    toast('JWT generation not implemented yet', { position: 'bottom-center' })
  }
}

export const Home: Component = () => {
  const location = useLocation()
  const logout = useLogout()
  const { authData } = useAuthData()
  const generateJWT = useGenerateJWT()

  // Get campaign marker from navigation state (passed from root)
  const campaign = location.state?.campaign || ''

  // Hard code to Base Sepolia (if you have a config, otherwise use EthSepolia)
  // const chain = Chains['BaseSepolia']

  return (
    <Show when={authData.ethAddress} fallback={<Navigate href="/" />}>
      <section class="flex-col flex items-center">
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
              }}>
              Copy Address
            </button>
          </div>
          {campaign && (
            <div class="stat-desc mt-2 text-md">
              <span>Campaign: {campaign}</span>
            </div>
          )}
        </div>
        <button
          class="btn btn-wide mt-8 btn-primary"
          onClick={generateJWT}
        >
          CLAIM
        </button>
        <button
          class="btn btn-wide btn-outline mt-8"
          onClick={() => {
            logout()
          }}>
          LOGOUT
        </button>
      </section>
    </Show>
  )
}
