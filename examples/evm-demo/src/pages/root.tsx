import { type Component, Show, createSignal, from, onMount } from 'solid-js'
import { Navigate, useNavigate, useSearchParams } from '@solidjs/router'
import toast from 'solid-toast'
import { connectSmartWalletWithPasskey } from '../passkey/webauthn'
import { passkeyWalletAddress, setPasskeyWalletAddress } from '../passkey/store'
import { cardId, campaign, updateCardIdAndCampaignFromUrl } from '../card/store'

export const Root: Component = () => {
  const [connectWalletLoading, setConnectWalletLoading] = createSignal(false)
  const [newWalletLoading, setNewWalletIsLoading] = createSignal(false)
  const navi = useNavigate()
  const [searchParams] = useSearchParams()

  onMount(() => {
    updateCardIdAndCampaignFromUrl(searchParams)
  })

  // Test params
  const testCampaign = 'Open Passkey'
  const testEthAddress = '0x1234567890abcdef1234567890abcdef12345670'
  const testCardId = 'open_passkey'

  const testCampaign2 = 'Open Passkey'
  const testEthAddress2 = '0x1234567890abcdef1234567890abcdef123456XX'
  const testCardId2 = 'open_passkey'

  const testEthAddress3 = '0xAa3B07dF07d2a0ed8Bb5fF9c0Fff34Cbf92eDA33'
  const testCardId3 = 'testcase4'

  const generateJWT = useGenerateJWT(testCampaign, testEthAddress, testCardId)
  const downloadPkpass = useDownloadPkpass(
    testCampaign,
    testEthAddress,
    testCardId
  )
  const generateJWT2 = useGenerateJWT(
    testCampaign2,
    testEthAddress2,
    testCardId2
  )
  const downloadPkpass2 = useDownloadPkpass(
    testCampaign2,
    testEthAddress2,
    testCardId2
  )

  const downloadPkpass3 = generatePass(
    testCampaign,
    testEthAddress3,
    testCardId3,
    'apple'
  )

  const generateJWT3 = generatePass(
    testCampaign,
    testEthAddress3,
    testCardId3,
    'google'
  )

  const handleTestPass = () => {
    const os = getMobileOS()
    if (os === 'android') {
      generateJWT()
    } else if (os === 'ios') {
      downloadPkpass()
    } else {
      toast.error('Unsupported device', { position: 'bottom-center' })
    }
  }

  const handleTestPass2 = () => {
    const os = getMobileOS()
    if (os === 'android') {
      generateJWT2()
    } else if (os === 'ios') {
      downloadPkpass2()
    } else {
      toast.error('Unsupported device', { position: 'bottom-center' })
    }
  }

  const handleTestPass3 = () => {
    console.log('handleTestPass3')
    const os = getMobileOS()
    if (os === 'android') {
      generateJWT3()
    } else if (os === 'ios') {
      downloadPkpass3()
    } else {
      toast.error('Unsupported device', { position: 'bottom-center' })
    }
  }

  async function connectWallet(makeNew = false) {
    makeNew ? setNewWalletIsLoading(true) : setConnectWalletLoading(true)
    try {
      const passkeyWalletData = await connectSmartWalletWithPasskey(makeNew)
      setPasskeyWalletAddress({ address: passkeyWalletData.address })
    } catch (error) {
      console.log(error)
      toast.error('Failed to connect Passkey wallet')
    } finally {
      makeNew ? setNewWalletIsLoading(false) : setConnectWalletLoading(false)
    }
  }

  return (
    <Show
      when={!passkeyWalletAddress.address || !campaign() || !cardId()}
      fallback={<Navigate href="/home" />}>
      <section class="justify-center flex-col flex">
        {campaign() && cardId() ? (
          <>
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold">
                {campaign()
                  ? `Collect ${campaign()} card of ${cardId()}`
                  : 'Connect Wallet'}
              </h2>
            </div>
            <button
              class="btn btn-wide mt-8 mx-auto"
              classList={{ loading: newWalletLoading() }}
              onClick={() => connectWallet(true)}>
              Create new PassKey
            </button>
            <button
              class="btn btn-wide mt-8 mx-auto"
              classList={{ loading: connectWalletLoading() }}
              onClick={() => connectWallet()}>
              Connect Existing PassKey
            </button>
          </>
        ) : (
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold">
              Please use correct URL with campaign and card id
            </h2>
          </div>
        )}
      </section>
    </Show>
  )
}

function generatePass(
  campaign: string,
  ethAddress: string,
  cardId: string,
  platform: string
) {
  return async () => {
    try {
      const externalId = `${cardId}-${ethAddress}`

      console.log(`External ID: ${externalId}`)

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
        platform === 'google' ? '/api/jwtToken' : '/api/generatePkpass'

      console.log(`URL: ${url}`)

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
