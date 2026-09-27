import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { api, token } from './api.js'
import Login from './Login.jsx'
import Overview from './Overview.jsx'
import Messages from './Messages.jsx'
import Settings from './Settings.jsx'
import './admin.css'

function Guard({ children }) {
  const [ok, setOk] = useState(null)
  useEffect(() => {
    if (!token.get()) return setOk(false)
    api('/auth/me').then(() => setOk(true)).catch(() => setOk(false))
  }, [])
  if (ok === null) return <div className="adm-loading">Loading…</div>
  return ok ? children : <Navigate to="/admin/login" replace />
}

const Icon = {
  grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  inbox: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 13h5l2 3h4l2-3h5" /><path d="M5 5h14l2 8v6H3v-6z" /></svg>,
  gear: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>,
  out: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
  site: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>,
}

function Layout({ children }) {
  const nav = useNavigate()
  const [unread, setUnread] = useState(0)
  useEffect(() => {
    const load = () => api('/admin/stats').then((s) => setUnread(s.new)).catch(() => {})
    load()
    const t = setInterval(load, 20000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand"><img src="/img/logo.png" alt="Bestik" /><span>Dashboard</span></div>
        <nav>
          <NavLink to="/admin" end>{Icon.grid}Overview</NavLink>
          <NavLink to="/admin/messages">{Icon.inbox}Messages {unread > 0 && <b className="pill">{unread}</b>}</NavLink>
          <NavLink to="/admin/settings">{Icon.gear}Settings</NavLink>
        </nav>
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noreferrer">{Icon.site}View website</a>
          <button onClick={() => { token.clear(); nav('/admin/login') }}>{Icon.out}Log out</button>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  )
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="*" element={
        <Guard>
          <Layout>
            <Routes>
              <Route index element={<Overview />} />
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:id" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Layout>
        </Guard>
      } />
    </Routes>
  )
}
