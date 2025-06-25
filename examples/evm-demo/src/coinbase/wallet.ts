import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { setCoinBaseWalletAddresses } from './store'

export const sdk = createCoinbaseWalletSDK({
  appName: 'OpenPassKey',
  appChainIds: [8453],
  preference: {
    options: 'smartWalletOnly',
  },
})

const provider = sdk.getProvider()

export async function fillCoinbaseWalletAddresses() {
  setCoinBaseWalletAddresses(
    (await provider.request({ method: 'eth_accounts' })) as string[]
  )
}

export async function connectCoinbaseWallet() {
  setCoinBaseWalletAddresses(
    (await provider.request({ method: 'eth_requestAccounts' })) as string[]
  )
}

export async function disconnectCoinbaseWallet() {
  try {
    provider.disconnect()
    setCoinBaseWalletAddresses([])
  } catch (error) {
    console.error('Failed to disconnect wallet:', error)
  }
}
