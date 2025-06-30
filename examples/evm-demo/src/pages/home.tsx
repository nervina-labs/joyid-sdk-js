import { type Component, Show, onMount } from 'solid-js'
import { writeClipboard } from '@solid-primitives/clipboard'
import { Navigate, useLocation } from '@solidjs/router'
import toast from 'solid-toast'
import { useAuthData } from '../hooks/localStorage'
import { truncateMiddle } from '../utils'
import { useSearchParams } from '@solidjs/router'
import { passkeyWalletAddress, setPasskeyWalletAddress } from '../passkey/store'
import { cardId, campaign, updateCardIdAndCampaignFromUrl } from '../card/store'

// Dont need that, QR code can be read by the user. QR code contains card_id and campaign

// import { createQuery } from '@tanstack/solid-query'
// import { formatEther } from 'ethers/lib/utils'
// import { useProvider } from '../hooks/provider'
// import { Chains } from '../chains'
// import { produce } from 'solid-js/store'
// import { type connectCallback } from '@joyid/evm'

//construct a pass JSON

function generatePass(
  campaign: string,
  ethAddress: string,
  cardId: string,
  platform: string
) {
  return async () => {
    try {
      const externalId = `${cardId}-${ethAddress}`

      // Start listening for the SSE event BEFORE triggering the backend
      const evtSource = new EventSource(
        `/api/wallet-pass-callback?id=${externalId}`
      )

      evtSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE message:', data)
          if (data.fileURL) {
            // Redirect to the pass URL
            window.location.href = data.fileURL
            evtSource.close() // Clean up
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err)
        }
      })

      evtSource.addEventListener('error', (event) => {
        console.error('SSE error:', event)
        evtSource.close()
      })

      const url =
        (import.meta.env.VITE_PUBLIC_BACKEND_ROOT ||
          'https://openpasskeywallet-ckb-demo.vercel.app') +
        (platform === 'google' ? '/api/jwtToken' : '/api/generatePkpass')

      console.log(`Request URL: ${url}`)
      // Now trigger the backend to start the pass creation process
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign, ethAddress, cardId }),
      })

      if (res.ok) {
        toast.success('Pass created successfully, please wait', {
          position: 'bottom-center',
        })
      }
      if (!res.ok) {
        toast.error('Error: ' + res.statusText, { position: 'bottom-center' })
        return
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

async function createPassAndListen(
  campaign: string,
  ethAddress: string,
  cardId: string
) {
  // Construct the externalId (should match what your backend expects)
  // Optionally, show a loading indicator while waiting for the SSE event
}

export const Home: Component = () => {
  // Get campaign marker from navigation state (passed from root)
  const [searchParams] = useSearchParams()

  onMount(() => {
    updateCardIdAndCampaignFromUrl(searchParams)
  })

  const getAndroidPass = generatePass(
    campaign(),
    passkeyWalletAddress.address,
    cardId(),
    'google'
  )
  const getiOSPass = generatePass(
    campaign(),
    passkeyWalletAddress.address,
    cardId(),
    'apple'
  )

  const handleClaim = () => {
    const os = getMobileOS()
    if (os === 'android') {
      getAndroidPass()
    } else if (os === 'ios') {
      getiOSPass()
    } else {
      toast.error('Unsupported device', { position: 'bottom-center' })
    }
  }

  // Hard code to Base Sepolia (if you have a config, otherwise use EthSepolia)
  // const chain = Chains['BaseSepolia']

  return (
    <Show when={passkeyWalletAddress.address} fallback={<Navigate href="/" />}>
      <section class="flex-col flex items-center">
        <div class="stat">
          <div class="stat-title">EVM Account</div>
          <div class="stat-value">
            {truncateMiddle(passkeyWalletAddress.address)}
          </div>
          <div class="stat-actions mt-2">
            <button
              class="btn btn-xs btn-success btn-outline"
              onClick={() => {
                writeClipboard(passkeyWalletAddress.address)
                toast.success('Copied Successfully', {
                  position: 'bottom-center',
                })
              }}>
              Copy Address
            </button>
          </div>
          {campaign && (
            <div class="stat-desc mt-2 text-md">
              <span>Campaign: {campaign()}</span>
            </div>
          )}
        </div>
        <button class="btn btn-wide mt-8 btn-primary" onClick={handleClaim}>
          CLAIM
        </button>
        <button
          class="btn btn-wide btn-outline mt-8"
          onClick={() => {
            setPasskeyWalletAddress({ address: '' })
          }}>
          Disconnect Passkey
        </button>
      </section>
    </Show>
  )
}
