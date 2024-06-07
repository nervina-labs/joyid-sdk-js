import { type Wallet } from '@rainbow-me/rainbowkit'
import { joyidConnector, type EvmConfig } from '@joyid/wagmi'
import { type CreateConnectorFn, createConnector } from 'wagmi'

export type { EvmConfig } from '@joyid/wagmi'

export { joyidConnector } from '@joyid/wagmi'

export const createJoyIdWallet = (joyidConfig: EvmConfig) => (): Wallet => ({
  id: 'joyid',
  name: 'JoyID Passkey',
  iconUrl: 'https://joy.id/logo.png',
  iconBackground: '#fff',
  downloadUrls: {
    browserExtension: 'https://joyid.id',
  },
  createConnector: (walletDetails) => {
    const connector: CreateConnectorFn = joyidConnector(joyidConfig)

    return createConnector((config) => ({
      ...connector(config),
      ...walletDetails,
    }))
  },
})
