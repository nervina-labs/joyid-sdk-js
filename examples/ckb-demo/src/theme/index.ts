import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#D2FF00',
      100: '#D2FF00',
      500: '#D2FF00',
    },
  },
  breakpoints: {
    base: '0',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
  },
})
