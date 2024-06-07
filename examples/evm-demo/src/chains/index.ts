import chainList from './chains.json'

export interface Chain {
  name: string
  chainId: number
  rpcURL: string
  unit: string
  faucet: string
  explorer: string
}

export const EthSepolia: Chain = chainList[0]

export const Chains = chainList.reduce((prev, acc) => {
  prev[acc.name] = acc
  return prev
}, {} as Record<string, Chain>)
