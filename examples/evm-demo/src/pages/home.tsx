import { type Component, Show, onMount } from 'solid-js'
import { writeClipboard } from '@solid-primitives/clipboard'
import { Navigate, useLocation } from '@solidjs/router'
import toast from 'solid-toast'
import { useAuthData, useLogout } from '../hooks/localStorage'
import { truncateMiddle } from '../utils'
import { useSearchParams } from '@solidjs/router'
// import { createQuery } from '@tanstack/solid-query'
// import { formatEther } from 'ethers/lib/utils'
// import { useProvider } from '../hooks/provider'
// import { Chains } from '../chains'
// import { produce } from 'solid-js/store'
// import { type connectCallback } from '@joyid/evm'

function useGenerateJWT(campaign: string, ethAddress: string, cardId: string) {
  return async () => {
    try {
      const res = await fetch('/api/jwtToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign, ethAddress, cardId }),
      })
      const data = await res.json()
      if (res.ok) {
        // Redirect to Google Pay Save to Wallet
        window.location.href = `https://pay.google.com/gp/v/save/${data.token}`
      } else {
        toast.error('Error: ' + data.error, { position: 'bottom-center' })
      }
    } catch (err) {
      toast.error('Network error', { position: 'bottom-center' })
    }
  }
}

function useDownloadPkpass(
  campaign: string,
  ethAddress: string,
  cardId: string
) {
  return async () => {
    // For iOS/Safari, do a direct POST navigation
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/generatePkpass'
    form.style.display = 'none'

    const addField = (name: string, value: string) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.append(input)
    }
    addField('campaign', campaign)
    addField('ethAddress', ethAddress)
    addField('cardId', cardId)

    document.body.append(form)
    form.submit()
    form.remove()
    return
  }
}

function getMobileOS() {
  const userAgent = window.navigator.userAgent || ''
  if (/android/i.test(userAgent)) {
    return 'android'
  }
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'ios'
  }
  return 'other'
}

export const Home: Component = () => {
  const location = useLocation()
  const logout = useLogout()
  const { authData } = useAuthData()
  // Get campaign marker from navigation state (passed from root)
  const [searchParams] = useSearchParams()
  const campaign =
    searchParams.campaign || localStorage.getItem('campaign') || ''
  const cardId = searchParams.card_id || localStorage.getItem('card_id') || ''

  if (campaign) {
    localStorage.setItem('campaign', campaign)
  }

  if (cardId) {
    localStorage.setItem('card_id', cardId)
  }

  const generateJWT = useGenerateJWT(campaign, authData.ethAddress, cardId)
  const downloadPkpass = useDownloadPkpass(
    campaign,
    authData.ethAddress,
    cardId
  )

  const handleClaim = () => {
    const os = getMobileOS()
    if (os === 'android') {
      generateJWT()
    } else if (os === 'ios') {
      downloadPkpass()
    } else {
      toast.error('Unsupported device', { position: 'bottom-center' })
    }
  }

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
        <button class="btn btn-wide mt-8 btn-primary" onClick={handleClaim}>
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
