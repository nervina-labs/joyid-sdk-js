import { providers } from 'ethers'
import { useAuthData } from './localStorage'
import { createMemo } from 'solid-js'

export const SepoliaNetwork = {
  name: 'Ethereum Sepolia',
  chainId: 11155111,
}

export const useProvider = () => {
  const { authData } = useAuthData()
  // eslint-disable-next-line solid/reactivity
  return createMemo(() =>
    authData.name
      ? new providers.JsonRpcBatchProvider(authData.rpcURL, {
          name: authData.name,
          chainId: authData.chainId,
        })
      : null
  )
}
