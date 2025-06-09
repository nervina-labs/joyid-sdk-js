import { type Component, Show, createSignal, onMount } from 'solid-js'
import { Navigate, useNavigate, useSearchParams } from '@solidjs/router'
import { useAuthData } from '../hooks/localStorage'
import { connect, initConfig } from '@joyid/evm'
import { EthSepolia } from '../chains'
import toast from 'solid-toast'

export const Root: Component = () => {
  const [isLoading, setIsLoading] = createSignal(false)
  const navi = useNavigate()
  const { setAuthData, authData } = useAuthData()
  const [searchParams] = useSearchParams()
  const [campaignMarker, setCampaignMarker] = createSignal('')
  const [cardId, setCardId] = createSignal('')

  onMount(() => {
    // Get campaign marker from URL
    const marker = searchParams.campaign
    const cardId = searchParams.card_id
    if (marker) {
      setCampaignMarker(marker)
    }

    if (cardId) {
      setCardId(cardId)
    }

    // Initialize with fixed network
    initConfig({
      network: {
        chainId: EthSepolia.chainId,
        name: EthSepolia.name,
      },
    })
  })

  const onConnect = async () => {
    setIsLoading(true)
    try {
      const address = await connect()
      setAuthData({
        ethAddress: address,
        mode: 'popup',
        ...EthSepolia,
      })
      let url = '/home'
      const params = []
      if (campaignMarker())
        params.push(`campaign=${encodeURIComponent(campaignMarker())}`)
      if (cardId()) params.push(`card_id=${encodeURIComponent(cardId())}`)
      if (params.length > 0) url += '?' + params.join('&')
      navi(url)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Test params
  const testCampaign = 'Open Passkey'
  const testEthAddress = '0x1234567890abcdef1234567890abcdef12345679'
  const testCardId = 'open_passkey'

  const generateJWT = useGenerateJWT(testCampaign, testEthAddress, testCardId)
  const downloadPkpass = useDownloadPkpass(
    testCampaign,
    testEthAddress,
    testCardId
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

  return (
    <Show when={!authData.ethAddress} fallback={<Navigate href="/home" />}>
      <section class="justify-center flex-col flex">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold">
            {campaignMarker()
              ? `Collect ${campaignMarker()} card`
              : 'Connect Wallet'}
          </h2>
        </div>
        <button
          class="btn btn-wide mt-8"
          classList={{ loading: isLoading() }}
          onClick={onConnect}>
          Connect
        </button>
        {
          <button class="btn btn-wide mt-8 btn-info" onClick={handleTestPass}>
            Download Test Pass
          </button>
        }
      </section>
    </Show>
  )
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
