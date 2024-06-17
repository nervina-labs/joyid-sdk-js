import React, { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as JotaiProvider } from 'jotai'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ChakraProvider } from '@chakra-ui/react'
import { I18nextProvider } from 'react-i18next'
import { initConfig } from '@joyid/ckb'
import { Router } from './route'
import i18n from './i18n'
import { theme } from './theme'
import './index.css'
import { JOY_ID_SERVER_URL, JOY_ID_URL } from './env'
import { init } from './lumos'

initConfig({
  joyidAppURL: JOY_ID_URL,
  joyidServerURL: JOY_ID_SERVER_URL,
  logo: `${location.origin}/vite.svg`,
  name: 'CKB Demo',
})
init()

export const App: React.FC = () => {
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <JotaiProvider>
          <ChakraProvider theme={theme}>
            <Router />
          </ChakraProvider>
        </JotaiProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}

createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
