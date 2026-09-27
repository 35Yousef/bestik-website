import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, token } from './api.js'

export default function Login() {
  const nav = useNavigate()
  const [f, setF] = useState({ username: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const { token: t } = await api('/auth/login', { method: 'POST', body: f })
      token.set(t)
      nav('/admin')
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }
  return (
    <div className="adm-login">
      <form onSubmit={submit} className="adm-login-card">
        <img src="/img/hero-cat.png" alt="" className="adm-login-cat" />
        <h1>Welcome back, <span>cat</span></h1>
        <p>Log in to the Bestik dashboard</p>
        <label>Username<input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoFocus autoComplete="username" /></label>
        <label>Password<input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></label>
        {err && <div className="adm-alert bad">{err}</div>}
        <button className="adm-btn primary" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
    </div>
  )
}
