/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-dynamic-delete */

import { DappError, DappErrorName } from './errors'
import { decode, encode } from './qss'

export function parseSearchWith(parser: (str: string) => any) {
  return (searchStr: string): any => {
    if (searchStr.substring(0, 1) === '?') {
      searchStr = searchStr.substring(1)
    }

    const query: Record<string, unknown> = decode(searchStr)

    // Try to parse any query params that might be json
    for (const key in query) {
      const value = query[key]
      if (typeof value === 'string') {
        try {
          query[key] = parser(value)
        } catch (err) {
          //
          // throw new Error(`invalid params: ${key}: ${value}`)
        }
      }
    }

    if (Object.keys(query).length === 0) {
      throw new DappError('Invalid request', DappErrorName.InvalidParams)
    }

    return query
  }
}

export function stringifySearchWith(
  stringify: (search: any) => string,
  parser?: (str: string) => any
) {
  function stringifyValue(val: any) {
    if (typeof val === 'object' && val !== null) {
      try {
        return stringify(val)
      } catch (err) {
        // silent
      }
    } else if (typeof val === 'string' && typeof parser === 'function') {
      try {
        // Check if it's a valid parseable string.
        // If it is, then stringify it again.
        parser(val)
        return stringify(val)
      } catch (err) {
        // silent
      }
    }
    return val
  }

  return (search: Record<string, any>) => {
    search = { ...search }

    if (search) {
      Object.keys(search).forEach((key) => {
        const val = search[key]
        if (typeof val === 'undefined' || val === undefined) {
          delete search[key]
        } else if (Array.isArray(val)) {
          search[key] = val.map(stringifyValue)
        } else {
          search[key] = stringifyValue(val)
        }
      })
    }

    const searchStr = encode(search as Record<string, string>).toString()

    return searchStr ? `?${searchStr}` : ''
  }
}

export const decodeSearch = parseSearchWith(JSON.parse)
export const encodeSearch = stringifySearchWith(JSON.stringify, JSON.parse)
