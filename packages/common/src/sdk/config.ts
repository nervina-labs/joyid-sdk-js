import { type DappConfig } from '../types/dapp'

export const internalConfig: DappConfig = {
  joyidAppURL: 'https://testnet.joyid.dev',
}

export const initConfig = (config?: DappConfig): DappConfig => {
  Object.assign(internalConfig, config)

  return internalConfig
}

export const getConfig = (): DappConfig => internalConfig
