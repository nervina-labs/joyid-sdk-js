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
      //localStorage.setItem('campaign', marker)
      //toast.success('Setting Campaign: ' + marker, {
      //  position: 'bottom-center',
      //})
    }

    if (cardId) {
      setCardId(cardId)
      //localStorage.setItem('card_id', cardId)
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
      //navi(
      //  `/home?campaign=${encodeURIComponent(campaignMarker())}&card_id=${encodeURIComponent(cardId())}`
      //)
      //navi('/home', { state: { campaign: campaignMarker(), cardId: cardId() } })
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
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
      </section>
    </Show>
  )
}
