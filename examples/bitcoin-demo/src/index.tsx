/* @refresh reload */
import './global.css'

import { render } from 'solid-js/web'
import { Router } from '@solidjs/router'

import App from './app'

const root = document.querySelector('#root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?'
  )
}

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  root!
)
