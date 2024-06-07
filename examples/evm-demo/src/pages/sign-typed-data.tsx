import { Navigate, useLocation, useNavigate } from '@solidjs/router'
import { Component, Show, createSignal } from 'solid-js'
import toast from 'solid-toast'
import { verifyTypedData } from 'ethers/lib.esm/utils'
import {
  signMessageCallback,
  signTypedData,
  signTypedDataWithRedirect,
} from '@joyid/evm'
import { useAuthData } from '../hooks/localStorage'
import { buildRedirectUrl } from '../utils'

export const SignTypeData: Component = () => {
  const location = useLocation<ReturnType<typeof signMessageCallback>>()
  const [signature, setSignature] = createSignal(
    location.state?.signature || ''
  )
  const navi = useNavigate()
  const { authData } = useAuthData()
  const typedData = {
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: authData.chainId,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    types: {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  } as const

  const onSignMessagePopup = async () => {
    const sig = await signTypedData(typedData, authData.ethAddress)
    setSignature(sig)
  }

  const onSignMessageRedirect = () => {
    const url = buildRedirectUrl('sign-typed-data')
    signTypedDataWithRedirect(url, typedData, authData.ethAddress)
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
      const res = verifyTypedData(
        typedData.domain,
        typedData.types as any,
        typedData.message,
        signature()
      )
      alert(`Recover address: ${res}\nCurrent address: ${authData.ethAddress}`)
      console.log(res)
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
        <div class="collapse collapse-arrow w-80 mt-4">
          <input type="checkbox" />
          <div class="collapse-title px-0">
            <label class="label">
              <span class="label-text">Typed Data</span>
            </label>
          </div>
          <div class="collapse-content px-0">
            <pre>
              <code class="break-all">
                {JSON.stringify(typedData, null, 2)}
              </code>
            </pre>
          </div>
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
          Sign Typed Data
        </button>
        <button
          class="btn btn-wide btn-outline btn-secondary mt-8"
          disabled={signature().length === 0}
          onClick={onVerifyMessage}
        >
          Recover Typed Data
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
