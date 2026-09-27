import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, timeAgo, token } from './api.js'

const TABS = [['all', 'Inbox'], ['new', 'Unread'], ['replied', 'Replied'], ['starred', 'Starred'], ['archived', 'Archived']]

export default function Messages() {
  const { id } = useParams()
  const nav = useNavigate()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [list, setList] = useState([])
  const [cur, setCur] = useState(null)
  const [err, setErr] = useState('')

  const load = useCallback(() => {
    api(`/admin/messages?status=${tab}&q=${encodeURIComponent(q)}`).then((d) => setList(d.messages)).catch((e) => setErr(e.message))
  }, [tab, q])
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t) }, [load])
  useEffect(() => {
    if (!id) return setCur(null)
    api(`/admin/messages/${id}`).then((d) => { setCur(d.message); load() }).catch((e) => setErr(e.message))
  }, [id]) // eslint-disable-line

  async function patch(p) {
    const d = await api(`/admin/messages/${cur.id}`, { method: 'PATCH', body: p })
    setCur(d.message); load()
  }
  async function remove() {
    if (!window.confirm('Delete this message permanently?')) return
    await api(`/admin/messages/${cur.id}`, { method: 'DELETE' })
    nav('/admin/messages'); load()
  }
  async function exportCsv() {
    const res = await fetch('/api/admin/export.csv', { headers: { Authorization: `Bearer ${token.get()}` } })
    const blob = await res.blob()
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bestik-messages.csv'; a.click()
  }

  return (
    <>
      <header className="adm-head">
        <div><h1>Messages</h1><p>Everything submitted through the contact forms.</p></div>
        <button className="adm-btn" onClick={exportCsv}>Export CSV</button>
      </header>
      {err && <div className="adm-alert bad">{err}</div>}
      <div className={`inbox ${cur ? 'has-cur' : ''}`}>
        <section className="adm-card inbox-list">
          <input className="adm-input" placeholder="Search name, email, message…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="tabs">{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
          {list.length === 0 && <p className="muted" style={{ padding: 16 }}>No messages here.</p>}
          {list.map((m) => (
            <button key={m.id} className={`msg-row ${m.status} ${cur?.id === m.id ? 'active' : ''}`} onClick={() => nav(`/admin/messages/${m.id}`)}>
              <div className="msg-top"><b>{m.starred && '★ '}{m.name}</b><small>{timeAgo(m.createdAt)}</small></div>
              <div className="msg-svc">{m.service}{m.mail?.error && <span className="tag bad">mail failed</span>}{m.status === 'replied' && <span className="tag ok">replied</span>}</div>
              <div className="ellipsis muted">{m.message}</div>
            </button>
          ))}
        </section>
        <section className="adm-card inbox-view">
          {!cur ? <div className="empty"><img src="/img/about-cat.png" alt="" /><p>Select a message to read it</p></div> : <Detail m={cur} patch={patch} remove={remove} onReplied={(m) => { setCur(m); load() }} back={() => nav('/admin/messages')} />}
        </section>
      </div>
    </>
  )
}

function Detail({ m, patch, remove, onReplied, back }) {
  const [body, setBody] = useState('')
  const [subject, setSubject] = useState(`Re: Your ${m.service} inquiry — Bestik`)
  const [st, setSt] = useState({ s: 'idle', t: '' })
  useEffect(() => { setBody(''); setSubject(`Re: Your ${m.service} inquiry — Bestik`); setSt({ s: 'idle', t: '' }) }, [m.id]) // eslint-disable-line

  async function reply(e) {
    e.preventDefault()
    setSt({ s: 'sending', t: '' })
    try {
      const d = await api(`/admin/messages/${m.id}/reply`, { method: 'POST', body: { body, subject } })
      setBody(''); setSt({ s: 'ok', t: `Reply sent to ${m.email}` }); onReplied(d.message)
    } catch (e2) { setSt({ s: 'bad', t: e2.message }) }
  }
  return (
    <div className="detail">
      <div className="detail-bar">
        <button className="adm-btn ghost only-mobile" onClick={back}>← Back</button>
        <button className="adm-btn ghost" onClick={() => patch({ starred: !m.starred })}>{m.starred ? '★ Starred' : '☆ Star'}</button>
        <button className="adm-btn ghost" onClick={() => patch({ status: m.status === 'new' ? 'read' : 'new' })}>{m.status === 'new' ? 'Mark read' : 'Mark unread'}</button>
        <button className="adm-btn ghost" onClick={() => patch({ status: m.status === 'archived' ? 'read' : 'archived' })}>{m.status === 'archived' ? 'Unarchive' : 'Archive'}</button>
        <button className="adm-btn danger" onClick={remove}>Delete</button>
      </div>
      <h2 className="detail-name">{m.name}</h2>
      <div className="detail-meta">
        <a href={`mailto:${m.email}`}>{m.email}</a>
        {m.phone && <a href={`https://wa.me/${m.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer">{m.phone} (WhatsApp)</a>}
        <span>{new Date(m.createdAt).toLocaleString('en-GB')}</span>
      </div>
      <div className="chips">
        <span className="chip pink">{m.service}</span>
        {m.budget && <span className="chip gold">{m.budget}</span>}
        {m.company && <span className="chip">{m.company}</span>}
        <span className="chip">via {m.source}</span>
      </div>
      <div className="bubble">{m.message}</div>
      <div className="mailstate">
        <span className={m.mail?.adminNotified ? 'ok' : 'bad'}>{m.mail?.adminNotified ? '✓' : '✗'} Team notified by email</span>
        <span className={m.mail?.autoReplied ? 'ok' : 'bad'}>{m.mail?.autoReplied ? '✓' : '✗'} Auto-reply sent to client</span>
        {m.mail?.error && <span className="bad">Error: {m.mail.error}</span>}
      </div>
      {m.thread?.length > 0 && (
        <div className="thread">
          <h3>Your replies</h3>
          {m.thread.map((r, i) => (
            <div className="bubble me" key={i}><small>{r.subject} · {new Date(r.at).toLocaleString('en-GB')} · by {r.by}</small><div>{r.body}</div></div>
          ))}
        </div>
      )}
      <form className="reply" onSubmit={reply}>
        <h3>Reply by email</h3>
        <input className="adm-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea className="adm-input" rows={6} placeholder={`Write to ${m.name}…`} value={body} onChange={(e) => setBody(e.target.value)} />
        {st.s === 'ok' && <div className="adm-alert ok">{st.t}</div>}
        {st.s === 'bad' && <div className="adm-alert bad">{st.t}</div>}
        <button className="adm-btn primary" disabled={st.s === 'sending' || body.trim().length < 2}>{st.s === 'sending' ? 'Sending…' : 'Send reply'}</button>
      </form>
    </div>
  )
}
