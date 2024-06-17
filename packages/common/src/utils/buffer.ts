/* eslint-disable unicorn/no-for-loop */
/* eslint-disable unicorn/prefer-code-point */
/* eslint-disable unicorn/text-encoding-identifier-case */
/**
 * Convert from a Base64URL-encoded string to an Array Buffer. Best used when converting a
 * credential ID from a JSON string to an ArrayBuffer, like in allowCredentials or
 * excludeCredentials
 *
 * Helper method to compliment `bufferToBase64URLString`
 */
export function base64URLStringToBuffer(base64URLString: string): ArrayBuffer {
  // Convert from Base64URL to Base64
  const base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/')
  /**
   * Pad with '=' until it's a multiple of four
   * (4 - (85 % 4 = 1) = 3) % 4 = 3 padding
   * (4 - (86 % 4 = 2) = 2) % 4 = 2 padding
   * (4 - (87 % 4 = 3) = 1) % 4 = 1 padding
   * (4 - (88 % 4 = 0) = 4) % 4 = 0 padding
   */
  const padLength = (4 - (base64.length % 4)) % 4
  const padded = base64.padEnd(base64.length + padLength, '=')

  // Convert to a binary string
  const binary = atob(padded)

  // Convert binary string to buffer
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return buffer
}

/**
 * Convert the given array buffer into a Base64URL-encoded string. Ideal for converting various
 * credential response ArrayBuffers to string for sending back to the server as JSON.
 *
 * Helper method to compliment `base64URLStringToBuffer`
 */
export function bufferToBase64URLString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ''

  for (let i = 0; i < bytes.length; i++) {
    const charCode = bytes[i]
    if (charCode != null) {
      str += String.fromCharCode(charCode)
    }
  }

  const base64String = btoa(str)

  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function hexToArrayBuffer(input: string): ArrayBuffer {
  const view = new Uint8Array(input.length / 2)
  for (let i = 0; i < input.length; i += 2) {
    // eslint-disable-next-line unicorn/prefer-string-slice
    view[i / 2] = Number.parseInt(input.substring(i, i + 2), 16)
  }

  return view.buffer
}

export function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function appendBuffer(
  buffer1: ArrayBuffer,
  buffer2: ArrayBuffer
): ArrayBuffer {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(new Uint8Array(buffer1), 0)
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
  return tmp.buffer
}

export function bufferToUTF8String(value: ArrayBuffer): string {
  return new TextDecoder('utf-8').decode(value)
}

export function utf8StringToBuffer(value: string): ArrayBuffer {
  return new TextEncoder().encode(value)
}

export function hexToUTF8String(value: string): string {
  return bufferToUTF8String(hexToArrayBuffer(value))
}

export function remove0x(hex: string): string {
  return hex.startsWith('0x') ? hex.slice(2) : hex
}

export function append0x(hex: string): string {
  return hex.startsWith('0x') ? hex : `0x${hex}`
}

export function hexToString(hex: string): string {
  let str = ''
  for (let i = 0; i < hex.length; i += 2)
    // eslint-disable-next-line unicorn/prefer-string-slice
    str += String.fromCharCode(Number.parseInt(hex.substr(i, 2), 16))
  return str
}

export function base64urlToHex(s: string) {
  return bufferToHex(base64URLStringToBuffer(s))
}
