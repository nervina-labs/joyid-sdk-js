import { type RouteObject } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Home } from '../pages/Home'
import { Root } from '../pages/Root'
import { SignMessage } from '../pages/SignMessage'
import { SignTransaction } from '../pages/SignTransaction'
import { RoutePath } from './path'
import { SignCotaNFT } from '../pages/SignCotaNFT'
import { SignCkbRawTx } from '../pages/SignCkbRawTx'

export const routers: RouteObject[] = [
  {
    path: RoutePath.Root,
    element: <Layout />,
    hasErrorBoundary: true,
    children: [
      {
        path: RoutePath.Root,
        element: <Root />,
      },
      {
        path: RoutePath.Home,
        element: <Home />,
      },
      {
        path: RoutePath.SignMessage,
        element: <SignMessage />,
      },
      {
        path: RoutePath.CKBTransfer,
        element: <SignTransaction />,
      },
      {
        path: RoutePath.CotaNFTTransfer,
        element: <SignCotaNFT />,
      },
      {
        path: RoutePath.SignCkbRawTx,
        element: <SignCkbRawTx />,
      },
    ],
  },
]
