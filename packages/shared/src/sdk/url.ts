import type { BaseRequest, DappResponse } from '../types/dapp'
import { encodeSearch, decodeSearch } from '../utils'
import { getConfig } from './config'
import { RedirectErrorWithState } from './errors'

const JOYID_REDIRECT = 'joyid-redirect'

export const getRedirectResponse = <T extends { state?: any }>(
  uri?: string
): DappResponse<T>['data'] => {
  const url = new URL(uri ?? window.location.href)
  const data = url.searchParams.get('_data_')
  if (data == null) {
    throw new Error('No data found')
  }
  const res = decodeSearch(data) as DappResponse<T>
  if (res.error != null) {
    throw new RedirectErrorWithState(res.error, res.state)
  }
  return res.data
}

export const buildJoyIDURL = <T extends BaseRequest>(
  request: T,
  type: 'popup' | 'redirect',
  path: string
): string => {
  const joyidURL = request.joyidAppURL ?? getConfig().joyidAppURL
  const url = new URL(`${joyidURL}`)
  url.pathname = path
  let redirectTo = request.redirectURL
  if (type === 'redirect') {
    const redirectURL = new URL(redirectTo)
    redirectURL.searchParams.set(JOYID_REDIRECT, 'true')
    redirectTo = redirectURL.href
  }
  url.searchParams.set('type', type)
  const data = encodeSearch({
    ...request,
    redirectURL: redirectTo,
  })
  url.searchParams.set('_data_', data)
  return url.href
}

export const isRedirectFromJoyID = (uri?: string): boolean => {
  try {
    const url = new URL(uri ?? window.location.href)
    return url.searchParams.has(JOYID_REDIRECT)
  } catch (error) {
    return false
  }
}
