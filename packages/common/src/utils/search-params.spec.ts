import { describe, expect, it } from 'vitest'
import { encodeSearch, decodeSearch } from './search-params'

describe('search-params', () => {
  describe('array', () => {
    it('array', () => {
      const data = {
        a: [1, 2, 3],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('array - single number', () => {
      const data = {
        a: [1],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('array - single string', () => {
      const data = {
        a: ['1'],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('array - single object', () => {
      const data = {
        a: [{ b: 1 }],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('array - single object with array', () => {
      const data = {
        a: [{ b: [1, 2] }],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('array - single object with object', () => {
      const data = {
        a: [{ b: { c: 1 } }],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('array - single object with array of objects', () => {
      const data = {
        a: [{ b: [{ c: 1 }, { c: 2 }] }],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('array - single object with object of arrays', () => {
      const data = {
        a: [{ b: { c: [1, 2] } }],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('array - multiple types', () => {
      const data = {
        a: [1, '2', { c: 3 }],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('array - nested', () => {
      const data = {
        a: [1, [2, [3]]],
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })
  })

  describe('object', () => {
    it('object - single number', () => {
      const data = {
        a: { b: 1 },
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('object - single string', () => {
      const data = {
        a: { b: '1' },
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('object - single object', () => {
      const data = {
        a: { b: { c: 1 } },
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('object - single object with array', () => {
      const data = {
        a: { b: [1, 2] },
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('object - single object with object', () => {
      const data = {
        a: { b: { c: 1 } },
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('object - single object with array of objects', () => {
      const data = {
        a: { b: [{ c: 1 }, { c: 2 }] },
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('object - single object with object of arrays', () => {
      const data = {
        a: { b: { c: [1, 2] } },
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('object - multiple types', () => {
      const data = {
        a: { b: 1, c: '2', d: { e: 3 } },
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })

    it('object - nested', () => {
      const data = {
        a: { b: 1, c: { d: 2, e: { f: 3 } } },
      }

      const encoded = encodeSearch(data)
      expect(data).toStrictEqual(decodeSearch(encoded))
    })
  })
})
