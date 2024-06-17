import {
  createConnector,
  ChainNotConfiguredError,
  type CreateConnectorFn,
} from 'wagmi'
import {
  UserRejectedRequestError,
  type ProviderConnectInfo,
  getAddress,
  SwitchChainError,
} from 'viem'
import { EthereumProvider, type EvmConfig } from '@joyid/ethereum-provider'

export type { EvmConfig } from '@joyid/ethereum-provider'

export { EthereumProvider } from '@joyid/ethereum-provider'

export function joyidConnector(
  joyidConfig: EvmConfig
): CreateConnectorFn<EthereumProvider> {
  type Provider = EthereumProvider

  type Properties = {
    onConnect: (connectInfo: ProviderConnectInfo) => void
  }

  type StorageItem = {
    'joyid.disconnected': true
  }

  type Listener = Parameters<Provider['on']>[1]

  let _provider: Provider | undefined

  return createConnector<Provider, Properties, StorageItem>((config) => ({
    id: 'joyid-wallet',
    name: 'JoyID',
    type: joyidConnector.type,
    provider: _provider,
    async setup() {
      const provider = await this.getProvider()
      if (provider)
        provider.on('connect', this.onConnect.bind(this) as Listener)
    },
    async getProvider() {
      if (!_provider) {
        _provider = new EthereumProvider(config.chains as any, joyidConfig)
      }
      return _provider
    },
    async disconnect(): Promise<void> {
      const provider = await this.getProvider()

      provider.removeListener(
        'accountsChanged',
        this.onAccountsChanged.bind(this)
      )
      provider.removeListener('chainChanged', this.onChainChanged)
      provider.removeListener('disconnect', this.onDisconnect.bind(this))
      provider.on('connect', this.onConnect.bind(this) as Listener)

      provider.disconnect()
      // Add shim signalling connector is disconnected
      await config.storage?.setItem('joyid.disconnected', true)
    },
    async getAccounts() {
      const provider = await this.getProvider()
      const account = provider.getAccount()
      return account ? [account] : []
    },
    async getChainId() {
      const provider = await this.getProvider()
      return provider.getChainId()
    },
    async isAuthorized() {
      const provider = await this.getProvider()
      return provider.getAccount() !== null
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider()
      provider.switchChain(chainId)
      provider.emit('chainChanged', chainId)
      const chain = config.chains.find((x) => x.id === chainId)
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())
      return chain
    },
    async onAccountsChanged(accounts) {
      // Disconnect if there are no accounts
      if (accounts.length === 0) this.onDisconnect()
      // Connect if emitter is listening for connect event (e.g. is disconnected and connects through wallet interface)
      else if (config.emitter.listenerCount('connect')) {
        const chainId = (await this.getChainId()).toString()
        this.onConnect({ chainId })
        await config.storage?.removeItem('joyid.disconnected')
      }
      // Regular change event
      else
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        })
    },
    async onDisconnect() {
      const provider = await this.getProvider()

      // No need to remove 'metaMaskSDK.disconnected' from storage because `onDisconnect` is typically
      // only called when the wallet is disconnected through the wallet's interface, meaning the wallet
      // actually disconnected and we don't need to simulate it.
      config.emitter.emit('disconnect')

      provider.removeListener(
        'accountsChanged',
        this.onAccountsChanged.bind(this)
      )
      provider.removeListener('chainChanged', this.onChainChanged)
      provider.removeListener('disconnect', this.onDisconnect.bind(this))
      provider.on('connect', this.onConnect.bind(this))
    },
    async onConnect(connectInfo) {
      const accounts = await this.getAccounts()
      if (accounts.length === 0) return

      const chainId = Number(connectInfo.chainId)
      config.emitter.emit('connect', { accounts, chainId })

      const provider = await this.getProvider()
      if (provider) {
        provider.removeListener('connect', this.onConnect.bind(this))
        provider.on('accountsChanged', this.onAccountsChanged.bind(this))
        provider.on('chainChanged', this.onChainChanged)
        provider.on('disconnect', this.onDisconnect.bind(this))
      }
    },
    onChainChanged(chainId) {
      config.emitter.emit('change', { chainId: Number(chainId) })
    },
    async connect(options?: { chainId?: number; isReconnecting: boolean }) {
      const provider = await this.getProvider()
      const [account] = await this.getAccounts()
      let chainId = provider.getChainId()

      provider.removeListener('connect', this.onConnect.bind(this) as Listener)
      provider.on(
        'accountsChanged',
        this.onAccountsChanged.bind(this) as Listener
      )
      provider.on('chainChanged', this.onChainChanged as Listener)
      provider.on('disconnect', this.onDisconnect.bind(this) as Listener)
      if (account) {
        if (options?.chainId && options.chainId !== chainId) {
          await this.switchChain?.({ chainId })
          chainId = options.chainId
        }
        await config.storage?.removeItem('joyid.disconnected')
        return {
          accounts: [account],
          chainId,
        }
      }
      try {
        const address = await provider.connect()
        await config.storage?.removeItem('joyid.disconnected')
        return {
          accounts: [address],
          chainId,
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error?.message.includes('User rejected')
        ) {
          throw new UserRejectedRequestError(error)
        }

        throw error
      }
    },
  }))
}
joyidConnector.type = 'joyidWallet' as const
