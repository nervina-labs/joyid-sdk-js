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

// eslint-disable-next-line unicorn/no-array-reduce
export const Chains = chainList.reduce<Record<string, Chain>>((prev, acc) => {
  prev[acc.name] = acc
  return prev
}, {})
