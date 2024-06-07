import { Component, createEffect } from 'solid-js'
import { useRoutes } from '@solidjs/router'
import { Toaster } from 'solid-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { routes } from './routes'
import { initConfig } from '@joyid/evm'
import { useAuthData } from './hooks/localStorage'
import { JOY_ID_URL } from './env'

const qc = new QueryClient()

const App: Component = () => {
  const Route = useRoutes(routes)
  const { authData } = useAuthData()
  createEffect(() => {
    initConfig({
      name: 'JoyID EVM demo',
      logo: 'https://fav.farm/🆔',
      // optional
      joyidAppURL: JOY_ID_URL,
      rpcURL: authData.rpcURL,
      network: {
        name: authData.name,
        chainId: authData.chainId,
      },
    })
  })
  return (
    <>
      <Toaster />
      <QueryClientProvider client={qc}>
        <main class="h-100vh w-100% max-w-500px p-5">
          <Route />
        </main>
      </QueryClientProvider>
    </>
  )
}

export default App
