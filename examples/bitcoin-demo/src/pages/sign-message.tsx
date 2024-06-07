import { Navigate, useLocation, useNavigate } from '@solidjs/router'
import { Component, Show, createSignal } from 'solid-js'
import toast from 'solid-toast'
import {
  buildSignMessageUrl,
  signMessage,
  signMessageCallback,
  // signMessageWithRedirect,
} from '@joyid/bitcoin'
import { message as Message } from '@unisat/wallet-sdk'
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
  const [signType, setSignType] = createSignal<'bip322-simple' | 'ecdsa'>(
    'bip322-simple'
  )
  const { authData } = useAuthData()

  const onSignMessageRedirect = () => {
    const redirectURL = buildRedirectUrl('sign-message')
    const url = buildSignMessageUrl(
      {
        message: challenge(),
        redirectURL,
        address: authData.address,
        signMessageType: signType(),
      },
      'redirect'
    )
    window.location.assign(url)
    // signMessageWithRedirect(url, challenge(), authData.ethAddress, {
    //   state: challenge(),
    // })
  }

  const onSignMessagePopup = async () => {
    const sig = await signMessage(challenge(), signType())
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
      if (signType() === 'bip322-simple') {
        const res = Message.verifyMessageOfBIP322Simple(
          authData.address,
          challenge(),
          signature(),
          1
        )
        alert(!!res)
      } else {
        const res = Message.verifyMessageOfECDSA(
          authData.pubkey,
          challenge(),
          signature()
        )
        alert(!!res)
      }
    } catch (error) {
      console.log(error)
      toast.error(
        error instanceof Error ? error.message : JSON.stringify(error)
      )
    }
  }

  return (
    <Show when={authData.address} fallback={<Navigate href="/" />}>
      <section class="flex-col flex items-center">
        <div class="form-control w-full max-w-xs mb-10">
          <label class="label">
            <span class="label-text">Signing Type</span>
          </label>
          <select
            class="select select-primary w-full max-w-xs"
            value="bip32-simple"
            onChange={(e) => {
              const val = e.currentTarget.value
              setSignType(val as any)
            }}
          >
            <option value="bip322-simple">bip322-simple</option>
            <option value="ecdsa">ecdsa</option>
          </select>
        </div>
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
        >{`<< Go BACK`}</button>
      </section>
    </Show>
  )
}
