import {
  providers,
  Signer,
  type TypedDataDomain,
  type TypedDataField,
} from 'ethers'
import {
  type EvmConfig,
  type TransactionRequest,
  signTransaction,
  signMessage,
  initConfig,
  getConfig,
  getConnectedAddress,
} from '@joyid/evm'
import {
  type Bytes,
  arrayify,
  getAddress,
  type ConnectionInfo,
} from 'ethers/lib.esm/utils'

export class JoyIDSigner extends Signer {
  private readonly _address: string

  readonly provider: providers.Provider

  readonly joyidConfig: EvmConfig

  constructor(
    provider: providers.Provider,
    address: string,
    config = getConfig()
  ) {
    super()
    this._address = address
    this.provider = provider
    this.joyidConfig = config
  }

  async getAddress(): Promise<string> {
    return getAddress(this._address)
  }

  async signTransaction(tx: TransactionRequest): Promise<string> {
    return signTransaction(tx, this._address, this.joyidConfig)
  }

  connect(provider: providers.Provider): JoyIDSigner {
    return new JoyIDSigner(provider, this._address, this.joyidConfig)
  }

  async signMessage(message: string | Bytes): Promise<string> {
    return signMessage(
      typeof message === 'string' ? message : arrayify(message),
      this._address,
      this.joyidConfig
    )
  }

  _signTypedData(
    _domain: TypedDataDomain,
    _types: Record<string, TypedDataField[]>,
    _value: Record<string, any>
  ): never {
    throw new Error(
      'Ethers.js signTypedData is experimental, please use signTypedData from @joyid/ethers instead'
    )
  }
}

export class JoyIDProvider extends providers.JsonRpcProvider {
  joyidConfig: EvmConfig

  constructor(
    url?: ConnectionInfo | string,
    network?: providers.Networkish,
    config?: EvmConfig
  ) {
    super(url, network)
    this.joyidConfig = initConfig(config)
  }

  getSigner(): providers.JsonRpcSigner {
    const address = getConnectedAddress()
    if (address != null) {
      return new JoyIDSigner(this, address, this.joyidConfig) as any
    }
    throw new Error('No connected address')
  }
}

export {
  connect,
  type PopupConifg,
  signTypedData,
  type SignConfig,
  type EvmConfig,
  type TransactionRequest,
  initConfig,
  getConnectedAddress,
} from '@joyid/evm'
