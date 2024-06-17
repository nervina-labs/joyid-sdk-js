import {
  type EIP1193RequestFn,
  type EIP1474Methods,
  http,
  type Address,
  type Chain,
  type Hex,
  isHex,
  bytesToString,
  toBytes,
  ProviderRpcError,
} from 'viem'
import {
  type EvmConfig,
  connect,
  getConnectedAddress,
  initConfig,
  sendTransaction,
  signMessage,
  signTypedData,
  disconnect,
  safeExec,
} from '@joyid/evm'
import EventEmitter from 'eventemitter3'

function convertHexToUtf8(value: string): string {
  if (isHex(value)) {
    return bytesToString(toBytes(value))
  }

  return value
}

export type { EvmConfig } from '@joyid/evm'

export {
  getConnectedAddress,
  initConfig,
  disconnect,
  safeExec,
} from '@joyid/evm'

const CHAIN_ID_STORAGE_KEY = 'joyid:ethereum:chainId'

export class EthereumProvider extends EventEmitter {
  private chainId: number

  private account: Address | null = null

  private readonly chains: Chain[]

  constructor(chains: Chain[], config: EvmConfig) {
    super()
    let chainId = config.network?.chainId ?? chains?.[0]?.id
    const chainIdFromStorage = safeExec(() =>
      localStorage.getItem(CHAIN_ID_STORAGE_KEY)
    )
    if (chainIdFromStorage != null) {
      chainId = Number(chainIdFromStorage)
    }
    if (chainId == null) {
      throw new Error('No chain provided')
    }
    this.chainId = chainId
    this.account = getConnectedAddress()
    this.chains = chains
    this.initConfig(chainId, config)
  }

  public getAccount(): Address | null {
    return this.account ?? getConnectedAddress()
  }

  private initConfig(chainId: number, config?: EvmConfig): Chain {
    const chain = this.chains.find((c) => c.id === chainId)
    if (chain == null) {
      throw new Error(
        `Unsupported chain id: ${chainId}, chainId must be one of ${this.chains
          .map((c) => c.id)
          .join(',')}`
      )
    }
    const rpcURL = chain.rpcUrls.default.http[0]
    if (!rpcURL) {
      throw new Error('No rpc url provided in chains config')
    }
    initConfig({
      ...config,
      network: {
        chainId: chain.id,
        name: chain.name,
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: chain.rpcUrls.default.http,
        blockExplorerUrls: chain.blockExplorers?.default.url
          ? [chain.blockExplorers.default.url]
          : undefined,
      },
    })
    this.chainId = chainId
    return chain
  }

  public switchChain(chainId: number): Chain {
    const chain = this.initConfig(chainId)
    safeExec(() => {
      localStorage.setItem(CHAIN_ID_STORAGE_KEY, chainId.toString())
    })
    return chain
  }

  public getChainId(): number {
    return this.chainId
  }

  public async connect(): Promise<Address> {
    const account = await connect()
    this.emit('connect', {
      chainId: this.chainId.toString(),
    })
    this.emit('accountsChanged', [account])
    this.emit('chainChanged', this.chainId.toString())
    this.account = account
    return account
  }

  public disconnect(): void {
    safeExec(() => {
      this.emit('disconnect')
      this.account = null
      disconnect()
      localStorage.removeItem(CHAIN_ID_STORAGE_KEY)
    })
  }

  request: EIP1193RequestFn<EIP1474Methods> = async (args) => {
    switch (args.method) {
      case 'eth_requestAccounts': {
        const account = await this.connect()
        this.account = account
        return [account] as any
      }
      case 'eth_accounts': {
        return [this.account] as any
      }
      case 'eth_chainId': {
        return this.chainId
      }
      case 'eth_sign': {
        throw new Error('eth_sign is not supported, use personal_sign instead')
      }
      case 'wallet_switchEthereumChain': {
        const [chainId] = args.params as [chainId: string]
        this.emit('chainChanged', chainId)
        return undefined
      }
      case 'personal_sign': {
        const [data, address] = args.params as [
          /** Data to sign */
          data: Hex,
          /** Address to use for signing */
          address: Address,
        ]
        const msg = convertHexToUtf8(data)
        try {
          const sig = await signMessage(
            isHex(msg) ? toBytes(msg) : msg,
            address
          )
          return sig
        } catch (error) {
          throw new ProviderRpcError(error as Error, {
            code: 4001,
            shortMessage: 'User rejected the request',
          })
        }
      }
      case 'eth_sendTransaction': {
        const [tx] = args.params as [transaction: any]
        try {
          const hash = await sendTransaction(tx)
          return hash
        } catch (error) {
          throw new ProviderRpcError(error as Error, {
            code: 4001,
            shortMessage: 'User rejected the request',
          })
        }
      }
      case 'eth_signTypedData_v4': {
        const [address, message] = args.params as [
          /** Address to use for signing */
          address: Address,
          /** Message to sign containing type information, a domain separator, and data */
          message: string,
        ]
        const msg = convertHexToUtf8(message)
        try {
          const sig = await signTypedData(JSON.parse(msg), address)
          return sig
        } catch (error) {
          throw new ProviderRpcError(error as Error, {
            code: 4001,
            shortMessage: 'User rejected the request',
          })
        }
      }
      default: {
        const chain = this.chains.find((c) => c.id === this.chainId)
        if (chain == null) {
          throw new Error(
            `Unsupported chain id: ${
              this.chainId
            }, chainId must be one of ${this.chains.map((c) => c.id).join(',')}`
          )
        }
        const httpProvider = http(chain.rpcUrls.default.http[0])
        return httpProvider({
          chain,
        }).request(args)
      }
    }
  }
}
