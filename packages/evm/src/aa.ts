import {
  type Hex,
  type SmartAccountSigner,
  type TypedDataDefinition,
  type AASignTypedDataParams,
} from '@joyid/common'
import {
  signMessage as signEvmMsg,
  signTypedData as signEvmTypedData,
} from './index'

export class JoyIDSigner implements SmartAccountSigner {
  address: Hex

  signerType = 'local'

  inner = 'useless'

  constructor(address: Hex) {
    this.address = address
  }

  readonly getAddress: () => Promise<Hex> = async () =>
    new Promise((resolve) => {
      resolve(this.address)
    })

  readonly signMessage: (msg: string | Uint8Array) => Promise<Hex> = async (
    msg
  ) => signEvmMsg(msg, this.address)

  readonly signTypedData: (params: AASignTypedDataParams) => Promise<Hex> =
    async (params) => {
      const typedData = params as TypedDataDefinition
      return signEvmTypedData(typedData, this.address)
    }
}
