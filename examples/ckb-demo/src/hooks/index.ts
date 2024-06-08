import { atomWithStorage, useAtomValue, useUpdateAtom } from 'jotai/utils'
import { AuthResponse } from '@joyid/ckb'

export const accountAtom = atomWithStorage<NonNullable<
  AuthResponse['data'] & { callbackType: 'redirect' | 'popup' }
> | null>('_demo_account_v2_', null)

export const useAccount = () => useAtomValue(accountAtom)

export const useSetAccountInfo = () => useUpdateAtom(accountAtom)
