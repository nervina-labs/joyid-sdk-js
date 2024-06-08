import { lazy } from 'solid-js'
import type { RouteDefinition } from '@solidjs/router'

import { Home } from './pages/home'
import { Root } from './pages/root'
import { SendBtc } from './pages/send'
import { SignMessage } from './pages/sign-message'
import { Redirect } from './pages/redirect'

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
    component: SendBtc,
  },
  {
    path: '/sign-message',
    component: SignMessage,
  },
  {
    path: '/redirect',
    component: Redirect,
  },
  {
    path: '**',
    component: lazy(async () => import('./errors/404')),
  },
]
