import { useEffect, useState } from 'react'
import { api } from './api.js'

export default function Settings() {
  const [d, setD] = useState(null)
  const [notify, setNotify] = useState('')
  const [autoReply, setAutoReply] = useState(true)
  const [testTo, setTestTo] = useState('')
  const [msg, setMsg] = useState({})

  useEffect(() => {
    api('/admin/settings').then((x) => { setD(x); setNotify(x.settings.notifyEmail || ''); setAutoReply(!!x.settings.autoReply); setTestTo(x.settings.notifyEmail || '') })
  }, [])

  const flash = (k, s, t) => setMsg((m) => ({ ...m, [k]: { s, t } }))
  async function save(e) {
    e.preventDefault()
    try { await api('/admin/settings', { method: 'PUT', body: { notifyEmail: notify, autoReply } }); flash('save', 'ok', 'Settings saved') }
    catch (e2) { flash('save', 'bad', e2.message) }
  }
  async function verify() {
    flash('smtp', 'info', 'Checking connection…')
    try { await api('/admin/mail/verify', { method: 'POST' }); flash('smtp', 'ok', 'SMTP connection works ✓') }
    catch (e) { flash('smtp', 'bad', e.message) }
  }
  async function test() {
    flash('smtp', 'info', 'Sending test email…')
    try { await api('/admin/mail/test', { method: 'POST', body: { to: testTo } }); flash('smtp', 'ok', `Test email sent to ${testTo} — check the inbox`) }
    catch (e) { flash('smtp', 'bad', e.message) }
  }
  const A = ({ k }) => msg[k] ? <div className={`adm-alert ${msg[k].s}`}>{msg[k].t}</div> : null

  if (!d) return <div className="adm-loading">Loading…</div>
  return (
    <>
      <header className="adm-head"><div><h1>Settings</h1><p>Where leads go and how the form answers visitors.</p></div></header>
      <div className="adm-cols">
        <form className="adm-card form-card" onSubmit={save}>
          <h2>Notifications</h2>
          <label>Send new-lead emails to<input className="adm-input" type="email" value={notify} onChange={(e) => setNotify(e.target.value)} placeholder="team@bestik.com" /></label>
          <label className="switch"><input type="checkbox" checked={autoReply} onChange={(e) => setAutoReply(e.target.checked)} /><span />Send automatic confirmation email to the visitor</label>
          <A k="save" />
          <button className="adm-btn primary">Save settings</button>
        </form>
        <section className="adm-card form-card">
          <h2>Email server (SMTP)</h2>
          {!d.smtp.configured && <div className="adm-alert info">Email is not configured yet — messages are still saved here. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and MAIL_FROM to the environment variables (Vercel → Settings → Environment Variables) and redeploy.</div>}
          <dl className="kv">
            <dt>Status</dt><dd>{d.smtp.configured ? '✓ Configured' : '✗ Not configured'}</dd>
            <dt>Storage</dt><dd>{d.storage === 'redis' ? 'Upstash Redis (persistent)' : 'JSON file'}</dd>
            <dt>Host</dt><dd>{d.smtp.host ? `${d.smtp.host}:${d.smtp.port}` : '—'}</dd>
            <dt>User</dt><dd>{d.smtp.user || '—'}</dd>
            <dt>From</dt><dd>{d.smtp.from || '—'}</dd>
          </dl>
          <p className="muted small">These come from <code>server/.env</code> locally, or the project's Environment Variables on Vercel.</p>
          <label>Send test email to<input className="adm-input" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} /></label>
          <A k="smtp" />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="adm-btn" onClick={verify} type="button">Check connection</button>
            <button className="adm-btn primary" onClick={test} type="button">Send test email</button>
          </div>
        </section>
      </div>
    </>
  )
}
