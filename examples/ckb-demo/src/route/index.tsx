import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routers } from './router'

const router = createBrowserRouter(routers)

export const Router = () => <RouterProvider router={router} />
