import { Show, createSignal } from 'solid-js'
import { writeClipboard } from '@solid-primitives/clipboard'
import { Toaster } from 'solid-toast'
import toast from 'solid-toast'

import { buildRedirectUrl } from './utils'
import {
  initConfig,
  connect,
  connectWithRedirect,
  connectCallback,
} from '@joyid/evm/web2login'

import joyidLogo from './assets/joyid.svg'
import './App.css'

declare let isProd: boolean
let _IsProd: boolean = false

function App() {
  try {
    _IsProd = isProd
  } catch (e) {
    /* empty */
  }

  initConfig({
    backgroundImage: `center center / cover no-repeat url("https://images.unsplash.com/photo-1601314167099-232775b3d6fd?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
    joyidAppURL: _IsProd ? 'https://app.joy.id' : 'https://testnet.joyid.dev',
  })

  const [address, setAddress] = createSignal('')

  try {
    setAddress(connectCallback().uid)
  } catch (error) {
    // TODO: handle error
  }

  function onConnectRedirect() {
    const url = buildRedirectUrl('connect')
    connectWithRedirect(url)
  }

  const onConnectPopup = async () => {
    console.log('onConnectPopup')
    const { uid } = await connect()
    console.log('address', uid)
    setAddress(uid)
  }

  const onCopyAddress = async () => {
    await writeClipboard(address())
    toast.success('Copied Successfully!', {
      position: 'bottom-center',
    })
  }

  return (
    <>
      <Toaster />
      <div>
        <a href="https://docs.joyid.dev/guide" target="_blank">
          <img src={joyidLogo} class="logo joyid" alt="joyid logo" />
        </a>
      </div>
      <h1>JoyID Web2Login Demo</h1>
      <Show when={address()}>
        <p>Address: {address()}</p>
        <button onClick={() => onCopyAddress()}>Copy Address</button>
      </Show>
      <div class="card">
        <button onClick={onConnectPopup}>
          Connect With <strong>POPUP</strong>
        </button>

        <button onClick={() => onConnectRedirect()}>
          Connect With <strong>REDIRECT</strong>
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p class="read-the-docs">Click on the JoyID logos to learn more</p>
    </>
  )
}

export default App
