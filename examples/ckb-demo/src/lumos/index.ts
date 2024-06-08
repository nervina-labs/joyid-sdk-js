/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-param-reassign */
// import { bytify } from '@ckb-lumos/codec/lib/bytes'
import {
  initializeConfig,
  createConfig,
  predefined,
  ScriptConfig,
} from '@ckb-lumos/config-manager'
import { RPC } from '@ckb-lumos/rpc'
import { Indexer } from '@ckb-lumos/ckb-indexer'
import { CredentialKeyType, SigningAlg } from '@joyid/ckb'
import { JOY_ID_LOCK_TX_HASH, CKB_RPC_URL, CKB_INDEXER_URL } from '../env'

export const rpc = new RPC(CKB_RPC_URL)
export const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL)

const joyidScriptConfig: ScriptConfig = {
  CODE_HASH:
    '0xd23761b364210735c19c60561d213fb3beae2fd6172743719eff6920e020baac',
  HASH_TYPE: 'type',
  TX_HASH: JOY_ID_LOCK_TX_HASH,
  INDEX: '0x0',
  DEP_TYPE: 'depGroup',
}

export function init(
  pubkey: string = '',
  keyType: CredentialKeyType = 'main_key',
  alg: SigningAlg = SigningAlg.ES256
) {
  initializeConfig(
    createConfig({
      PREFIX: 'ckt',
      SCRIPTS: {
        ...predefined.AGGRON4.SCRIPTS,
        JOYID: {
          ...joyidScriptConfig,
          pubkey,
          keyType,
          alg,
        },
      },
    })
  )
}
