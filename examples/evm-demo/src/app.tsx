import { type Component, createEffect } from 'solid-js'
import { useRoutes } from '@solidjs/router'
import { Toaster } from 'solid-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { routes } from './routes'

const qc = new QueryClient()

const App: Component = () => {
  const Route = useRoutes(routes)

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
