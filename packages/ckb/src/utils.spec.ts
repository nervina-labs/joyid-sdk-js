import { describe, it, expect } from 'vitest'
import { deserializeWitnessArgs } from './utils'
import { calculateChallenge, CKBTransaction } from '.'

describe('utils', () => {
  describe('deserializeWitnessArgs', () => {
    it('default_witness_args', async () => {
      const witnessArgs = deserializeWitnessArgs(
        '0x55000000100000005500000055000000410000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      )
      expect(witnessArgs.lock).toBe(`0x${'00'.repeat(65)}`)
      expect(witnessArgs.inputType).toBe('0x')
      expect(witnessArgs.outputType).toBe('0x')
    })

    it('custom_witness_args', async () => {
      const witnessArgs = deserializeWitnessArgs(
        '0x1a00000010000000100000001500000001000000100100000020'
      )
      expect(witnessArgs.lock).toBe('0x')
      expect(witnessArgs.inputType).toBe('0x10')
      expect(witnessArgs.outputType).toBe('0x20')
    })
  })

  describe('calculateChallenge', () => {
    it('verify_challenge_with_raw_tx', async () => {
      const ckbTx: CKBComponents.RawTransactionToSign = {
        version: '0x00',
        cellDeps: [
          {
            outPoint: {
              txHash:
                '0x069ae648ecc682caa52b1a6a5854ec3545a8513dd9681f452049a59be33465b0',
              index: '0x0',
            },
            depType: 'depGroup',
          },
          {
            outPoint: {
              txHash:
                '0xd8c7396f955348bd74a8ed4398d896dad931977b7c1e3f117649765cd3d75b86',
              index: '0x0',
            },
            depType: 'depGroup',
          },
        ],
        headerDeps: [],
        inputs: [
          {
            previousOutput: {
              txHash:
                '0x00ff48f637e12c8aa873d76cd1a9c3e3756f3e7df006760270f23a3a25782f87',
              index: '0x1',
            },
            since: '0x0',
          },
        ],
        outputs: [
          {
            capacity: '0x37e11d0ed',
            lock: {
              codeHash:
                '0xd23761b364210735c19c60561d213fb3beae2fd6172743719eff6920e020baac',
              hashType: 'type',
              args: '0x0001fd879d61c8187b4fa1e87296bb00371bfebc3a4e',
            },
            type: {
              codeHash:
                '0x89cd8003a0eaf8e65e0c31525b7d1d5c1becefd2ea75bb4cff87810ae37764d8',
              hashType: 'type',
              args: '0x226192f9ca4bcd697bd2fe4429f73a254de25e61',
            },
          },
        ],
        outputsData: [
          '0x020000000000000000000000000000000000000000000000000000000000000000',
        ],
        witnesses: [
          '0xc3010000100000001000000010000000af0100007b226964223a2243544d657461222c22766572223a22312e30222c226d65746164617461223a7b22746172676574223a226f75747075742330222c2274797065223a226a6f795f6964222c2264617461223a7b22616c67223a2230783031222c22636f746143656c6c4964223a22307830303030303030303030303030303030222c2263726564656e7469616c4964223a22307837363431643666613336316434326431663830613638396339376430656166376662643336663366303430343332626338313564333932643461366433356162222c2266726f6e745f656e64223a226a6f7969642d6170702d6465762e76657263656c2e617070222c226e616d65223a2273746f6e656b696e67222c227075625f6b6579223a2230786462333135323532356133353836616636346230636638376331636636626633613861663864633961323365383761356161366164316430633665303434376635316631343763363038613831613566383435303936326662383634386465653961636435343863623438626430656438383634326237356530373963616365222c2276657273696f6e223a2230227d7d7d',
        ],
      }

      const challenge = await calculateChallenge(ckbTx as CKBTransaction)
      expect(challenge).toBe(
        '8a4ae0acf8e6481a748627543225f497eaea5d754c9d72cfba8db800ac6d4d1b'
      )
    })
  })
})
