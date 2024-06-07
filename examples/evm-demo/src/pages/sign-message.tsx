import { Navigate, useLocation, useNavigate } from '@solidjs/router'
import { Component, Show, createSignal } from 'solid-js'
import toast from 'solid-toast'
import { verifyMessage } from 'ethers/lib.esm/utils'
import {
  signMessage,
  signMessageCallback,
  signMessageWithRedirect,
} from '@joyid/evm'
import { useAuthData } from '../hooks/localStorage'
import { buildRedirectUrl } from '../utils'

export const SignMessage: Component = () => {
  const location = useLocation<ReturnType<typeof signMessageCallback>>()
  const [challenge, setChallenge] = createSignal(
    location.state?.state || 'Hello World'
  )
  const [signature, setSignature] = createSignal(
    location.state?.signature || ''
  )
  const navi = useNavigate()
  const { authData } = useAuthData()

  const onSignMessageRedirect = () => {
    const url = buildRedirectUrl('sign-message')
    signMessageWithRedirect(url, challenge(), authData.ethAddress, {
      state: challenge(),
    })
  }

  const onSignMessagePopup = async () => {
    const sig = await signMessage(challenge(), authData.ethAddress)
    setSignature(sig)
  }

  const onSignMessage = () => {
    if (authData.mode === 'popup') {
      onSignMessagePopup()
    } else {
      onSignMessageRedirect()
    }
  }

  const onVerifyMessage = () => {
    try {
      const res = verifyMessage(challenge(), signature())
      alert(!!res)
    } catch (error) {
      console.log(error)
      toast.error(
        error instanceof Error ? error.message : JSON.stringify(error)
      )
    }
  }

  return (
    <Show when={authData.ethAddress} fallback={<Navigate href="/" />}>
      <section class="flex-col flex items-center">
        <div class="form-control w-80">
          <textarea
            class="textarea textarea-bordered textarea-md w-full"
            placeholder="To Address"
            value={challenge()}
            onInput={(e) => setChallenge(e.target.value)}
          />
        </div>
        <div class="form-control w-80 mt-8">
          <textarea
            class="textarea textarea-bordered textarea-md w-full"
            placeholder="Signature"
            value={signature()}
            readOnly
            disabled
          />
        </div>
        <button class="btn btn-wide btn-primary mt-12" onClick={onSignMessage}>
          Sign Message
        </button>
        <button
          class="btn btn-wide btn-outline btn-secondary mt-8"
          disabled={signature().length === 0}
          onClick={onVerifyMessage}
        >
          Verify Message
        </button>
        <button
          class="btn btn-wide btn-outline mt-8"
          onClick={() => {
            navi('/home', { replace: true })
          }}
        >{`<< Go Home`}</button>
      </section>
    </Show>
  )
}
