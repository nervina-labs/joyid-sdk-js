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

//construct a pass JSON

function useGenerateJWT(campaign: string, ethAddress: string, cardId: string) {
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

      // Now trigger the backend to start the pass creation process
      const res = await fetch('/api/jwtToken', {
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
      // I need the backend to handle creating the pass object and sending it. I have an API endpoint for this.
      // The endpoint is at /api/jwtToken, POST (campaign, ethAddress, cardId)

      // call the endpoint to create the pass object
      // const res = await fetch('/api/jwtToken', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({campaign, ethAddress, cardId}),
      // })

      // const data = await res.json()
      // if (res.ok) {

      //   // now we need to setup the SSE connection to the callback URL
      //   const eventSource = new EventSource(data.callbackUrl)
      //   eventSource.onmessage = (event) => {
      //     console.log('SSE message:', event.data)
      //   }
      //   eventSource.onerror = (event) => {
      //     console.error('SSE error:', event)
      //   }
      //   eventSource.onopen = () => {
      //     console.log('SSE connection opened')
      //   }
      //   eventSource.onclose = () => {
      //     console.log('SSE connection closed')
      //   }
      // } else {
      //   toast.error('Error: ' + data.error, { position: 'bottom-center' })
      // }
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
