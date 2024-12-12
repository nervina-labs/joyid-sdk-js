/* eslint-disable unicorn/prefer-string-slice */

import { append0x, remove0x } from '@joyid/common'
import { hexToBytes } from '@nervosnetwork/ckb-sdk-utils'

/**
 * Web crypto use IEEE P1363 ECDSA signature format
 * ref: https://stackoverflow.com/questions/39554165/ecdsa-signatures-between-node-js-and-webcrypto-appear-to-be-incompatible
 * code from: https://github.com/java-crypto/cross_platform_crypto/blob/main/docs/ecdsa_signature_conversion.md
 */
export function derToIEEE(sig: ArrayBuffer): Uint8Array {
  const signature = Array.from(new Uint8Array(sig), (x) =>
    `00${x.toString(16)}`.slice(-2)
  ).join('')
  const rLength = Number.parseInt(signature.substr(6, 2), 16) * 2
  let r = signature.substr(8, rLength)
  let s = signature.substr(12 + rLength)
  r = r.length > 64 ? r.substr(-64) : r.padStart(64, '0')
  s = s.length > 64 ? s.substr(-64) : s.padStart(64, '0')
  const p1363Sig = `${r}${s}`
  return new Uint8Array(
    p1363Sig.match(/[\da-f]{2}/gi)!.map((h) => Number.parseInt(h, 16))
  )
}

export function leHexStringToU32(hex: string): number {
  const bytes = hexToBytes(append0x(hex))
  const beHex = `0x${bytes.reduceRight((pre, cur) => pre + cur.toString(16).padStart(2, '0'), '')}`
  return Number.parseInt(beHex)
}

export function deserializeWitnessArgs(hex: string): CKBComponents.WitnessArgs {
  const args = remove0x(hex)
  // full_size(4bytes) + offsets(4bytes * 3) + body(lock + input_type + output_type)
  const lockOffset = leHexStringToU32(args.slice(8, 16)) * 2
  const inputTypeOffset = leHexStringToU32(args.slice(16, 24)) * 2
  const outputTypeOffset = leHexStringToU32(args.slice(24, 32)) * 2

  // lock = size(4bytes) + body
  const lock = args.slice(lockOffset, inputTypeOffset).slice(8)
  const inputType = args.slice(inputTypeOffset, outputTypeOffset).slice(8)
  const outputType = args.slice(outputTypeOffset).slice(8)

  return {
    lock: lock.length === 0 ? '0x' : `0x${lock}`,
    inputType: inputType.length === 0 ? '0x' : `0x${inputType}`,
    outputType: outputType.length === 0 ? '0x' : `0x${outputType}`,
  }
}
