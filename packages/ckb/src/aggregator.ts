import fetch from 'cross-fetch'
import {
  type BaseReq,
  type BaseResp,
  type SubkeyUnlockReq,
  type SubkeyUnlockResp,
} from './types'

const payloadId = (): number => Date.now()

export class Aggregator {
  private readonly url: string

  constructor(url: string) {
    this.url = url
  }

  private async baseRPC(
    method: string,
    req: BaseReq | undefined,
    url = this.url
  ): Promise<BaseResp | undefined> {
    const payload = {
      id: payloadId(),
      jsonrpc: '2.0',
      method,
      params: req ?? null,
    }
    const body = JSON.stringify(payload, null, '')

    const data = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    }).then(async (res) => res.json())

    if (data.error != null) {
      throw new Error(`RPC error: ${JSON.stringify(data.error)}`)
    }

    return data.result
  }

  async generateSubkeyUnlockSmt(
    req: SubkeyUnlockReq
  ): Promise<SubkeyUnlockResp> {
    return (await this.baseRPC(
      'generate_subkey_unlock_smt',
      req
    )) as Promise<SubkeyUnlockResp>
  }
}
