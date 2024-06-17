/* eslint-disable unicorn/prefer-string-slice */
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
