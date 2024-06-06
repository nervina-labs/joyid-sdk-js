import {
  type Hex,
  type SmartAccountSigner,
  type TypedData,
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
    await new Promise((resolve) => {
      resolve(this.address)
    })

  readonly signMessage: (msg: string | Uint8Array) => Promise<Hex> = async (
    msg
  ) => await signEvmMsg(msg, this.address)

  readonly signTypedData: (params: AASignTypedDataParams) => Promise<Hex> =
    async (params) => {
      const typedData = params as TypedData
      return await signEvmTypedData(typedData, this.address)
    }
}
