import { providers, ethers, BigNumber } from 'ethers'
import { Interface, getAddress } from 'ethers/lib/utils'
import ERC20_ABI from './abi.json'
import { DEFAULT_ERC20_CONTRACT_ADDRESS } from '../constant'

export const getERC20Balance = async (
  address: string,
  provider: providers.Provider
) => {
  const contract = new ethers.Contract(
    DEFAULT_ERC20_CONTRACT_ADDRESS,
    ERC20_ABI,
    provider
  )

  return contract.balanceOf(address) as Promise<BigNumber>
}

export const buildERC20Data = (toAddress: string, amount: BigNumber) => {
  const iface = new Interface(ERC20_ABI)
  const rawData = iface.encodeFunctionData('transfer', [
    getAddress(toAddress),
    amount,
  ])
  return rawData
}
