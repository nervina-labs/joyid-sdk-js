import { Navigate, useLocation, useNavigate } from '@solidjs/router'
import toast from 'solid-toast'
import { type Component, Show, createSignal, onMount } from 'solid-js'
import {
  signPsbt,
  buildSignPsbtURL,
  type signPsbtCallback,
  // signPsbts,
} from '@joyid/bitcoin'
import { sendBtc } from '@rgbpp-sdk/btc'
// import { useProvider } from '../hooks/provider'
import { useAuthData } from '../hooks/localStorage'
import { useSendSuccessToast } from '../hooks/useSendSuccessToast'
import { DEFAULT_SEND_ADDRESS } from '../constant'
import { btcDataSource, btcService } from '../hooks/service'
import { buildRedirectUrl } from '../utils'

export const SendBtc: Component = () => {
  const [toAddress, setToAddress] = createSignal(DEFAULT_SEND_ADDRESS)
  const [toAmount, setAmount] = createSignal('0.0001')
  const location = useLocation<ReturnType<typeof signPsbtCallback>>()
  const navi = useNavigate()
  // const provider = useProvider()
  const { authData } = useAuthData()
  const [isLoading, setIsLoading] = createSignal(false)
  const successToast = useSendSuccessToast()
  const onReset = () => {
    setToAddress(DEFAULT_SEND_ADDRESS)
  }

  onMount(async () => {
    if (location.state?.tx) {
      // const txRes = await provider()!.sendTransaction(location.state?.tx)
      successToast(location.state?.tx)
      navi('/home', { replace: true })
    }
  })

  const buildPsbt = async () => {
    const psbt = await sendBtc({
      from: authData.address,
      fromPubkey: authData.pubkey,
      // minUtxoSatoshi: MIN_UTXO_AMOUNT,
      tos: [
        {
          address: toAddress(),
          value: Number.parseInt((Number(toAmount()) * 1e8).toString(), 10),
        },
      ],
      feeRate: 1,
      source: btcDataSource,
    })
    return psbt
  }

  const errorHandler = (error: unknown) => {
    const formattedError =
      error instanceof Error ? error.message : JSON.stringify(error)
    toast.error(<div class="break-all">{formattedError}</div>, {
      position: 'bottom-center',
      duration: 5000,
      unmountDelay: 0,
    })
    console.log(error)
  }

  const onSendPopup = async () => {
    setIsLoading(true)
    try {
      const psbt = await buildPsbt()
      // const [tx] = await signPsbts([psbt.toHex()])
      const tx = await signPsbt(psbt.toHex())
      const txRes = await btcService.sendBtcTransaction(tx)
      successToast(txRes.txid)
    } catch (error) {
      errorHandler(error)
      //
    } finally {
      setIsLoading(false)
    }
  }

  const onSendRedirect = async () => {
    setIsLoading(true)
    try {
      const psbt = await buildPsbt()
      const rawTx = psbt.toHex()
      const url = buildSignPsbtURL(
        {
          tx: rawTx,
          signerAddress: authData.address,
          redirectURL: buildRedirectUrl('send'),
        },
        'redirect'
      )
      window.location.assign(url)
    } catch (error) {
      errorHandler(error)
    } finally {
      setIsLoading(false)
    }
    // signTransactionWithRedirect(url, {
    //   to: toAddress(),
    //   from: authData.ethAddress,
    //   value: parseEther(amount()).toString(),
    // })
  }

  const onSend = () => {
    if (authData.mode === 'popup') {
      onSendPopup()
    } else {
      onSendRedirect()
    }
  }

  return (
    <>
      <Show when={authData.address} fallback={<Navigate href="/" />}>
        <section class="flex-col flex items-center">
          <div class="form-control w-80">
            <label class="label">
              <span class="label-text">To Address</span>
            </label>
            <textarea
              class="textarea textarea-bordered textarea-md w-full"
              placeholder="To Address"
              value={toAddress()}
              onInput={(e) => setToAddress(e.target.value)}
            />
          </div>
          <div class="form-control w-80 mt-4">
            <label class="label">
              <span class="label-text">Amount</span>
            </label>
            <label class="input-group">
              <input
                type="number"
                class="input input-bordered w-full"
                value={toAmount()}
                onInput={(e) => setAmount(e.target.value)}
              />
              <span>BTC</span>
            </label>
          </div>
          <button
            class="btn btn-wide btn-primary mt-12"
            onClick={onSend}
            classList={{ loading: isLoading() }}>
            Send
          </button>
          <button
            class="btn btn-wide btn-outline btn-secondary mt-8"
            onClick={onReset}>
            Reset
          </button>
          <button
            class="btn btn-wide btn-outline mt-8"
            onClick={() => {
              navi('/home', { replace: true })
            }}>{`<< Go BACK`}</button>
        </section>
      </Show>
    </>
  )
}
