import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, timeAgo } from './api.js'

export default function Overview() {
  const [s, setS] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => { api('/admin/stats').then(setS).catch((e) => setErr(e.message)) }, [])
  if (err) return <div className="adm-alert bad">{err}</div>
  if (!s) return <div className="adm-loading">Loading…</div>
  const max = Math.max(1, ...s.days.map((d) => d.count))
  const maxSvc = Math.max(1, ...s.byService.map((d) => d.count))
  return (
    <>
      <header className="adm-head"><div><h1>Overview</h1><p>Leads coming in from the website contact forms.</p></div></header>
      <div className="adm-kpis">
        <div className="kpi"><span>Total messages</span><b>{s.total}</b></div>
        <div className="kpi pink"><span>Unread</span><b>{s.new}</b></div>
        <div className="kpi"><span>Replied</span><b>{s.replied}</b></div>
        <div className="kpi gold"><span>Last 7 days</span><b>{s.last7}</b></div>
      </div>
      {!s.mailConfigured && <div className="adm-alert info" style={{ marginBottom: 20 }}>Email sending is off until SMTP is configured — form messages are still saved here. See <Link to="/admin/settings">Settings</Link>.</div>}
      {s.mailConfigured && s.mailFailures > 0 && <div className="adm-alert bad" style={{ marginBottom: 20 }}>{s.mailFailures} message(s) were saved but the notification email failed. Check <Link to="/admin/settings">Settings → SMTP</Link>.</div>}
      <div className="adm-cols">
        <section className="adm-card">
          <h2>Messages — last 14 days</h2>
          <div className="bars">
            {s.days.map((d) => (
              <div className="bar" key={d.date} title={`${d.date}: ${d.count}`}>
                <div className="bar-val">{d.count || ''}</div>
                <div className="bar-fill" style={{ height: `${(d.count / max) * 100}%` }} />
                <div className="bar-lbl">{d.date.slice(8)}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="adm-card">
          <h2>By service</h2>
          {s.byService.length === 0 && <p className="muted">No data yet.</p>}
          <div className="hbars">
            {s.byService.map((x) => (
              <div key={x.service} className="hbar"><span>{x.service}</span><div><i style={{ width: `${(x.count / maxSvc) * 100}%` }} /></div><b>{x.count}</b></div>
            ))}
          </div>
        </section>
      </div>
      <section className="adm-card">
        <h2>Latest messages <Link to="/admin/messages" className="link">View all →</Link></h2>
        {s.recent.length === 0 && <p className="muted">No messages yet. Submit the form on the website to see one here.</p>}
        <div className="recent">
          {s.recent.map((m) => (
            <Link to={`/admin/messages/${m.id}`} key={m.id} className="recent-row">
              <span className={`dot ${m.status}`} />
              <b>{m.name}</b><span className="muted">{m.service}</span>
              <span className="ellipsis">{m.message}</span>
              <span className="muted">{timeAgo(m.createdAt)}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
