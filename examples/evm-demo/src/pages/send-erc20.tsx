/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Navigate, useLocation, useNavigate } from '@solidjs/router'
import toast from 'solid-toast'
import { Component, Show, createSignal, onMount } from 'solid-js'
import {
  signTransaction,
  signTransactionCallback,
  signTransactionWithRedirect,
} from '@joyid/evm'
import { useProvider } from '../hooks/provider'
import { useAuthData } from '../hooks/localStorage'
import { buildERC20Data } from '../erc20'
import { useSendSuccessToast } from '../hooks/useSendSuccessToast'
import {
  DEFAULT_ERC20_CONTRACT_ADDRESS,
  DEFAULT_SEND_ADDRESS,
} from '../constant'
import { parseUnits } from 'ethers/lib/utils'
import { buildRedirectUrl } from '../utils'

export const SendERC20: Component = () => {
  const [toAddress, setToAddress] = createSignal(DEFAULT_SEND_ADDRESS)
  const [amount, setAmount] = createSignal('0.01')
  const [decimals, setDecimals] = createSignal(6)
  const [contractAddress, setContractAddress] = createSignal(
    DEFAULT_ERC20_CONTRACT_ADDRESS
  )
  const navi = useNavigate()
  const provider = useProvider()
  const { authData } = useAuthData()
  const [isLoading, setIsLoading] = createSignal(false)
  const sendSuccessToast = useSendSuccessToast()
  const onReset = () => {
    setToAddress(DEFAULT_SEND_ADDRESS)
    setAmount('0.01')
    setDecimals(6)
    setContractAddress(DEFAULT_ERC20_CONTRACT_ADDRESS)
  }
  const location = useLocation<ReturnType<typeof signTransactionCallback>>()

  onMount(async () => {
    if (location.state?.tx) {
      const txRes = await provider()!.sendTransaction(location.state?.tx)
      sendSuccessToast(txRes.hash)
      navi('/home', { replace: true })
    }
  })

  const onSendPopup = async () => {
    const sendAmount = parseUnits(amount(), decimals())
    setIsLoading(true)
    try {
      const tx = await signTransaction({
        to: contractAddress(),
        from: authData.ethAddress,
        value: '0',
        data: buildERC20Data(toAddress(), sendAmount),
      })

      const txRes = await provider()!.sendTransaction(tx)

      sendSuccessToast(txRes.hash)
    } catch (error) {
      const formattedError =
        error instanceof Error ? error.message : JSON.stringify(error)
      toast.error(<div class="break-all">{formattedError}</div>, {
        position: 'bottom-center',
        duration: 5000,
      })
      console.log(error)
      //
    } finally {
      setIsLoading(false)
    }
  }

  const onSendRedirect = () => {
    const url = buildRedirectUrl('send-erc20')
    signTransactionWithRedirect(url, {
      to: contractAddress(),
      from: authData.ethAddress,
      value: '0',
      data: buildERC20Data(toAddress(), parseUnits(amount(), decimals())),
    })
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
      <Show when={authData.ethAddress} fallback={<Navigate href="/" />}>
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
              <span class="label-text">Enter amount</span>
            </label>
            <label class="input-group">
              <input
                type="number"
                class="input input-bordered w-full"
                value={amount()}
                onInput={(e) => setAmount(e.target.value)}
              />
              <span>ERC20</span>
            </label>
          </div>
          <div class="collapse collapse-arrow w-80 mt-4">
            <input type="checkbox" />
            <div class="collapse-title px-0">
              <label class="label">
                <span class="label-text">Contract Address</span>
              </label>
            </div>
            <div class="collapse-content px-0">
              <textarea
                class="textarea textarea-bordered textarea-md w-full"
                placeholder="Contract Address"
                value={contractAddress()}
                onInput={(e) => setContractAddress(e.target.value)}
              />
            </div>
          </div>
          <div class="collapse collapse-arrow w-80 mt-1">
            <input type="checkbox" />
            <div class="collapse-title px-0">
              <label class="label">
                <span class="label-text">Decimals</span>
              </label>
            </div>
            <div class="collapse-content px-0">
              <input
                type="number"
                class="input input-bordered input-md w-full"
                placeholder="Contract Address"
                value={decimals()}
                onInput={(e) => {
                  setDecimals(Number(e.target.value))
                }}
              />
            </div>
          </div>
          <button
            class="btn btn-wide btn-primary mt-12"
            onClick={onSend}
            classList={{ loading: isLoading() }}
          >
            Send
          </button>
          <button
            class="btn btn-wide btn-outline btn-secondary mt-8"
            onClick={onReset}
          >
            Reset
          </button>
          <button
            class="btn btn-wide btn-outline mt-8"
            onClick={() => {
              navi('/home', { replace: true })
            }}
          >{`<< Go Home`}</button>
        </section>
      </Show>
    </>
  )
}
