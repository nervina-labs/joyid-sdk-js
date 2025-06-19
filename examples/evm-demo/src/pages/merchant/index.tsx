import { createSignal } from 'solid-js'
import { useNavigate } from '@solidjs/router'

export default function MerchantLogin() {
  const [username, setUsername] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const navi = useNavigate()

  const handleLogin = async (e: Event) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/merchant-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username(), password: password() }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.success) {
      localStorage.setItem('merchantLoggedIn', '1')
      navi('/merchant/create')
    } else {
      // if data.message is JSON then show 'invalid username or password'
      if (typeof data.message === 'string' && data.message.length > 0) {
        setError(data.message)
      } else {
        setError('Invalid username or password')
      }
    }
  }

  return (
    <form class="flex flex-col items-center mt-16" onSubmit={handleLogin}>
      <h2 class="text-2xl mb-4">Merchant Login</h2>
      <input
        class="input input-bordered mb-2"
        type="text"
        placeholder="Username"
        value={username()}
        onInput={(e) => setUsername(e.currentTarget.value)}
        required
      />
      <input
        class="input input-bordered mb-2"
        type="password"
        placeholder="Password"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
        required
      />
      <button class="btn btn-primary mb-2" type="submit">
        Login
      </button>
      {error() && <div class="text-red-500">{error()}</div>}
    </form>
  )
}
