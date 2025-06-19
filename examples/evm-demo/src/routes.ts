import { lazy } from 'solid-js'
import type { RouteDefinition } from '@solidjs/router'

import { Home } from './pages/home'
import { Root } from './pages/root'
import { SendEth } from './pages/send'
import { SendERC20 } from './pages/send-erc20'
import { SignMessage } from './pages/sign-message'
import { SignTypeData } from './pages/sign-typed-data'
import { Redirect } from './pages/redirect'
import MerchantLogin from './pages/merchant/index'
import MerchantCreate from './pages/merchant/create'
import MerchantRedemption from './pages/merchant/redemption'

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Root,
  },
  {
    path: '/home',
    component: Home,
  },
  {
    path: '/send',
    component: SendEth,
  },
  {
    path: '/send-erc20',
    component: SendERC20,
  },
  {
    path: '/sign-message',
    component: SignMessage,
  },
  {
    path: '/sign-typed-data',
    component: SignTypeData,
  },
  {
    path: '/redirect',
    component: Redirect,
  },
  {
    path: '**',
    component: lazy(async () => import('./errors/404')),
  },
  {
    path: '/merchant',
    component: MerchantLogin,
  },
  {
    path: '/merchant/create',
    component: MerchantCreate,
  },
  {
    path: '/merchant/redemption',
    component: MerchantRedemption,
  },
]
