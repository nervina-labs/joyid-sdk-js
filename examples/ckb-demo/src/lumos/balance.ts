/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { parseAddress } from '@ckb-lumos/helpers'
import { indexer } from '.'

export const CKB_DECIMAL = BigInt(10 ** 8)

export async function capacityOf(address: string): Promise<string> {
  const lock = parseAddress(address)
  const collector = indexer.collector({ lock })

  let balance = BigInt(0)
  for await (const cell of collector.collect()) {
    balance += BigInt(cell.cellOutput.capacity)
  }

  const integer = balance / CKB_DECIMAL
  const fraction = balance % CKB_DECIMAL

  return `${integer}.${fraction}`
}
