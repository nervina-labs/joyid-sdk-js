export type Hex = string
export type Byte = string | number
export type Byte2 = string | number
export type Byte4 = string | number
export type Byte20 = string
export type Byte24 = string
export type Byte32 = string
export type Bytes = string
export type Address = string
export type Capacity = bigint

export interface ExtSubKey {
  ext_data: Byte4
  alg_index: Byte2
  pubkey_hash: Hex
}

export interface ExtSocial {
  recovery_mode: Byte
  must: Byte
  total: Byte
  signers: Hex[]
}

export interface BaseReq {}
export interface BaseResp {}

export interface ExtSubkeyReq extends BaseReq {
  lock_script: Bytes
  ext_action: Byte
  subkeys: ExtSubKey[]
}

export interface ExtSubkeyResp extends BaseResp {
  smt_root_hash: Byte32
  extension_smt_entry: Bytes
  block_number: bigint
}

export interface SubkeyUnlockReq extends BaseReq {
  lock_script: Bytes
  pubkey_hash: Hex
  alg_index: Byte2
}

export interface SubkeyUnlockResp extends BaseResp {
  unlock_entry: Bytes
  block_number: bigint
}

export interface ExtSocialReq extends BaseReq {
  lock_script: Bytes
  ext_action: Byte
  recovery_mode: Byte
  must: Byte
  total: Byte
  signers: Hex[]
}

export interface ExtSocialResp extends BaseResp {
  smt_root_hash: Byte32
  extension_smt_entry: Bytes
  block_number: bigint
}

export interface SocialFriend {
  lock_script: Hex
  pubkey: Hex
  signature?: Hex
  unlock_mode: Byte
  alg_index: Byte2
  private_key?: Hex
  address?: Address
}

export interface SocialUnlockReq extends BaseReq {
  lock_script: Bytes
  friends: SocialFriend[]
}

export interface SocialUnlockResp extends BaseResp {
  unlock_entry: Bytes
  block_number: bigint
}
