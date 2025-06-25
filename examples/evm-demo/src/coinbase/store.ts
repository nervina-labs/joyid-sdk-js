import { createStore } from 'solid-js/store'

export const [coinBaseWalletAddresses, setCoinBaseWalletAddresses] =
  createStore<string[]>([])
