import type { EventTemplate, Event } from './event'
import {
  createBlockDialog,
  buildJoyIDURL,
  authWithPopup,
  openPopup,
  runPopup,
  internalConfig as internalDappConfig,
  DappCommunicationType,
  DappRequestType,
  type DappConfig,
} from '@joyid/common'

type NostrConfig = DappConfig

type UnsignedEvent = EventTemplate<number> & {
  pubkey?: string
}

export type { UnsignedEvent }

export const initConfig = (config?: NostrConfig): DappConfig => {
  Object.assign(internalDappConfig, config)
  return internalDappConfig
}

export const getConfig = (): NostrConfig => internalDappConfig

const buildSignEventUrl = (event: UnsignedEvent): string => {
  const {
    joyidAppURL: __,
    joyidServerURL: _,
    ...dappConfig
  } = internalDappConfig
  return buildJoyIDURL(
    {
      ...dappConfig,
      redirectURL: location.href,
      event,
    },
    DappCommunicationType.Popup,
    '/sign-nostr-event'
  )
}

export const STORAGE_KEY = 'joyid:nostr::pubkey'

async function getPublicKey(): Promise<string> {
  const res = await authWithPopup({
    redirectURL: location.href,
    requestNetwork: 'nostr',
    ...internalDappConfig,
  })
  const pk = res.nostrPubkey
  localStorage.setItem(STORAGE_KEY, pk)
  return pk
}

async function signEvent(event: UnsignedEvent): Promise<Event<number>> {
  const popup = openPopup('')
  if (popup == null) {
    return createBlockDialog(async () => signEvent(event))
  }
  const pubkey = event.pubkey ?? localStorage.getItem(STORAGE_KEY)

  if (pubkey == null) {
    throw new Error('Please call getPublicKey() first or pass event.pubkey')
  }

  event.pubkey = pubkey || undefined

  popup.location.href = buildSignEventUrl(event)

  const res = await runPopup({
    timeoutInSeconds: 60 * 100,
    popup,
    type: DappRequestType.SignNostrEvent,
  })

  return res.event
}

export type NostrMessageSignType = 'encrypt' | 'decrypt'

const generateNostrMessageUrl = (
  pubkey: string,
  text: string,
  type: NostrMessageSignType
): string => {
  const {
    joyidAppURL: __,
    joyidServerURL: _,
    ...dappConfig
  } = internalDappConfig
  return buildJoyIDURL(
    {
      ...dappConfig,
      redirectURL: location.href,
      pubkey,
      text,
      type,
    },
    'popup',
    '/sign-nostr-message'
  )
}

async function encrypt(pubkey: string, plaintext: string): Promise<string> {
  const popup = openPopup('')

  if (popup == null) {
    return createBlockDialog(async () => encrypt(pubkey, plaintext))
  }

  popup.location.href = generateNostrMessageUrl(pubkey, plaintext, 'encrypt')

  const res = await runPopup({
    timeoutInSeconds: 60 * 100,
    popup,
    type: DappRequestType.EncryptNostrMessage,
  })

  if (res.error != null) {
    throw new Error(res.error)
  }

  return res.data.text as string
}

async function decrypt(pubkey: string, ciphertext: string): Promise<string> {
  const popup = openPopup('')

  if (popup == null) {
    return createBlockDialog(async () => decrypt(pubkey, ciphertext))
  }

  popup.location.href = generateNostrMessageUrl(pubkey, ciphertext, 'decrypt')

  const res = await runPopup({
    timeoutInSeconds: 6000,
    popup,
    type: DappRequestType.DecryptNostrMessage,
  })

  if (res.error != null) {
    throw new Error(res.error)
  }

  return res.data.text as string
}

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}

export const nostr = {
  getPublicKey,
  signEvent,
  nip04: {
    encrypt,
    decrypt,
  },
}

export { type Event } from './event'
export { openPopup } from '@joyid/common'
