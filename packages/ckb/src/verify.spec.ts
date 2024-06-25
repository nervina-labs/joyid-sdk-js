import { describe, it, expect } from 'vitest'
import {
  type SignMessageResponseData,
  hexToArrayBuffer,
  bufferToBase64URLString,
} from '@joyid/common'
import { verifyCredential, verifySignature } from './verify'
import r1_main_session_key_sign from '../fixtures/r1_main_session_key_sign.json'
import r1_mainkey_sign from '../fixtures/r1_mainkey_sign.json'
import r1_sub_session_key_sign from '../fixtures/r1_sub_session_key_sign.json'
import r1_subkey_sign from '../fixtures/r1_subkey_sign.json'
import rsa_main_session_key_sign from '../fixtures/rsa_main_session_key_sign.json'
import rsa_mainkey_sign from '../fixtures/rsa_mainkey_sign.json'
import rsa_sub_session_key_sign from '../fixtures/rsa_sub_session_key_sign.json'
import rsa_subkey_sign from '../fixtures/rsa_subkey_sign.json'
import r1_main_session_key_sign_credential from '../fixtures/r1_main_session_key_auth.json'
import r1_mainkey_sign_credential from '../fixtures/r1_mainkey_auth.json'
import r1_sub_session_key_sign_credential from '../fixtures/r1_sub_session_key_auth.json'
import r1_subkey_sign_credential from '../fixtures/r1_subkey_auth.json'
import rsa_main_session_key_sign_credential from '../fixtures/rsa_main_session_key_auth.json'
import rsa_mainkey_sign_credential from '../fixtures/rsa_mainkey_auth.json'
import rsa_sub_session_key_sign_credential from '../fixtures/rsa_sub_session_key_auth.json'
import rsa_subkey_sign_credential from '../fixtures/rsa_subkey_auth.json'

function convertData(data: SignMessageResponseData): SignMessageResponseData {
  return {
    ...data,
    signature: bufferToBase64URLString(hexToArrayBuffer(data.signature)),
    message: bufferToBase64URLString(hexToArrayBuffer(data.message)),
  }
}

describe('verify', () => {
  describe('verifySignature', () => {
    it('r1_main_session_key_sign', async () => {
      const res = await verifySignature(
        convertData(r1_main_session_key_sign as any)
      )
      expect(res).toBe(true)
    })

    it('r1_mainkey_sign', async () => {
      const res = await verifySignature(convertData(r1_mainkey_sign as any))
      expect(res).toBe(true)
    })

    it('r1_sub_session_key_sign', async () => {
      const res = await verifySignature(
        convertData(r1_sub_session_key_sign as any)
      )
      expect(res).toBe(true)
    })

    it('r1_subkey_sign', async () => {
      const res = await verifySignature(convertData(r1_subkey_sign as any))
      expect(res).toBe(true)
    })

    it('rsa_main_session_key_sign', async () => {
      const res = await verifySignature(
        convertData(rsa_main_session_key_sign as any)
      )
      expect(res).toBe(true)
    })

    it('rsa_mainkey_sign', async () => {
      const res = await verifySignature(convertData(rsa_mainkey_sign as any))
      expect(res).toBe(true)
    })

    it('rsa_sub_session_key_sign', async () => {
      const res = await verifySignature(
        convertData(rsa_sub_session_key_sign as any)
      )
      expect(res).toBe(true)
    })

    it('rsa_subkey_sign', async () => {
      const res = await verifySignature(convertData(rsa_subkey_sign as any))
      expect(res).toBe(true)
    })

    it('r1_main_session_key_sign with wrong pubkey', async () => {
      const res = await verifySignature({
        ...r1_main_session_key_sign,
        pubkey: 'wrong pubkey',
      } as any)
      expect(res).toBe(false)
    })
  })

  describe('verifyCredential', () => {
    const joyidServerURL = 'https://api.testnet.joyid.dev/api/v1'

    it('main key r1 with credential object', async () => {
      const credential = {
        address:
          'ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq8n3thvttqfasgrql80e3s5l66lcneyxrsuglhh2',
        pubkey:
          '93222c01a3514baab677d722b39b3dede3660e9203a729b969f82b98c428d441a32a8094bff3d90827ca326fb88066cf70bae9c67bef8494549315e7d7b152e6',
        keyType: 'main_key',
        alg: -7,
      } as const

      const res = await verifyCredential(credential, joyidServerURL)
      expect(res).toBe(true)
    })

    it('sub key r1 with credential object', async () => {
      const credential = {
        address:
          'ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq8n3thvttqfasgrql80e3s5l66lcneyxrsuglhh2',
        pubkey:
          'd81a8aca0dfabcb4a67fd3f3518daae06b2e93899fc4988b1dbf2cca496cfe4478444bfb9df5f3d65ec072c82817216442260ce108fa1fbe45999cc24aa93a81',
        keyType: 'sub_key',
        alg: -7,
      } as const

      const res = await verifyCredential(credential, joyidServerURL)
      expect(res).toBe(true)
    })

    it.skip('r1_main_session_key_auth', async () => {
      const { address, pubkey, keyType, alg } =
        r1_main_session_key_sign_credential
      const res = await verifyCredential(pubkey, address, keyType as any, alg)
      expect(res).toBe(true)
    })

    it.skip('r1_mainkey_auth', async () => {
      const { address, pubkey, keyType, alg } = r1_mainkey_sign_credential
      const res = await verifyCredential(pubkey, address, keyType as any, alg)
      expect(res).toBe(true)
    })

    it.skip('r1_sub_session_key_auth', async () => {
      const { address, pubkey, keyType, alg } =
        r1_sub_session_key_sign_credential
      const res = await verifyCredential(pubkey, address, keyType as any, alg)
      expect(res).toBe(true)
    })

    it.skip('r1_subkey_auth', async () => {
      const { address, pubkey, keyType, alg } = r1_subkey_sign_credential
      const res = await verifyCredential(pubkey, address, keyType as any, alg)
      expect(res).toBe(true)
    })

    it.skip('rsa_main_session_key_auth', async () => {
      const { address, pubkey, keyType, alg } =
        rsa_main_session_key_sign_credential
      const res = await verifyCredential(pubkey, address, keyType as any, alg)
      expect(res).toBe(true)
    })

    it.skip('rsa_mainkey_auth', async () => {
      const { address, pubkey, keyType, alg } = rsa_mainkey_sign_credential
      const res = await verifyCredential(pubkey, address, keyType as any, alg)
      expect(res).toBe(true)
    })

    it.skip('rsa_sub_session_key_auth', async () => {
      const { address, pubkey, keyType, alg } =
        rsa_sub_session_key_sign_credential
      const res = await verifyCredential(pubkey, address, keyType as any, alg)
      expect(res).toBe(true)
    })

    it.skip('rsa_subkey_auth', async () => {
      const { address, pubkey, keyType, alg } = rsa_subkey_sign_credential
      const res = await verifyCredential(pubkey, address, keyType as any, alg)
      expect(res).toBe(true)
    })

    it('r1_mainkey_auth with wrong pubkey', async () => {
      const { address, keyType, alg } = r1_mainkey_sign_credential
      const res = await verifyCredential(
        '0x1234567890123456789012345678901234567890',
        address,
        keyType as any,
        alg
      )
      expect(res).toBe(false)
    })
  })
})
