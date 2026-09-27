import { useState } from 'react'

export const SERVICES = [
  'Content Creation',
  'Website / Application Developing',
  'Graphic Designing',
  'Search Engine Optimization',
  'Media Planning & Buying',
  'Other',
]
const BUDGETS = ['Less than 10K EGP', '10K – 30K EGP', '30K – 75K EGP', '75K+ EGP', 'Not sure yet']

const empty = { name: '', email: '', phone: '', company: '', service: '', budget: '', message: '', website: '' }

function validate(v) {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Please tell us your name'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Enter a valid email'
  if (v.phone && !/^[+\d][\d\s-]{6,}$/.test(v.phone.trim())) e.phone = 'Enter a valid phone number'
  if (!v.service) e.service = 'Pick a service'
  if (v.message.trim().length < 10) e.message = 'Message should be at least 10 characters'
  return e
}

export default function ContactForm({ source = 'contact-section', onDone }) {
  const [v, setV] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ state: 'idle', text: '' })

  const set = (k) => (ev) => setV({ ...v, [k]: ev.target.value })

  async function submit(ev) {
    ev.preventDefault()
    const e = validate(v)
    setErrors(e)
    if (Object.keys(e).length) return
    setStatus({ state: 'sending', text: '' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, source }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        throw new Error(data.error || 'Something went wrong, please try again.')
      }
      setStatus({ state: 'ok', text: data.mail?.autoReplied
        ? 'Psst!! Your message reached Mau 🐾 We sent a confirmation to your inbox and will get back to you within 24 hours.'
        : 'Psst!! Your message reached Mau 🐾 We will get back to you within 24 hours.' })
      setV(empty)
      onDone?.()
    } catch (err) {
      setStatus({ state: 'bad', text: err.message })
    }
  }

  const F = ({ k, label, children, full }) => (
    <div className={`field ${full ? 'full' : ''} ${errors[k] ? 'err' : ''}`}>
      <label htmlFor={`${source}-${k}`}>{label}</label>
      {children}
      {errors[k] && <span className="msg">{errors[k]}</span>}
    </div>
  )

  return (
    <form className="form" onSubmit={submit} noValidate>
      {F({ k: 'name', label: 'Your name *', children: <input id={`${source}-name`} value={v.name} onChange={set('name')} placeholder="Mau the cat" autoComplete="name" /> })}
      {F({ k: 'email', label: 'Email *', children: <input id={`${source}-email`} type="email" value={v.email} onChange={set('email')} placeholder="you@company.com" autoComplete="email" /> })}
      {F({ k: 'phone', label: 'Phone / WhatsApp', children: <input id={`${source}-phone`} value={v.phone} onChange={set('phone')} placeholder="+20 1xx xxx xxxx" autoComplete="tel" /> })}
      {F({ k: 'company', label: 'Company', children: <input id={`${source}-company`} value={v.company} onChange={set('company')} placeholder="Brand name" /> })}
      {F({ k: 'service', label: 'Service *', children: (
        <select id={`${source}-service`} value={v.service} onChange={set('service')}>
          <option value="">Choose a service</option>
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>) })}
      {F({ k: 'budget', label: 'Budget', children: (
        <select id={`${source}-budget`} value={v.budget} onChange={set('budget')}>
          <option value="">Select range</option>
          {BUDGETS.map((s) => <option key={s}>{s}</option>)}
        </select>) })}
      {F({ k: 'message', label: 'Message *', full: true, children: <textarea id={`${source}-message`} value={v.message} onChange={set('message')} placeholder="Tell Mau about your project..." /> })}
      <input className="hp" tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} aria-hidden="true" />
      {status.state === 'ok' && <div className="alert ok" role="status">{status.text}</div>}
      {status.state === 'bad' && <div className="alert bad" role="alert">{status.text}</div>}
      <div className="form-actions">
        <button className="btn-gold lg" type="submit" disabled={status.state === 'sending'}>
          {status.state === 'sending' ? 'Sending…' : 'Send it to Mau'}
        </button>
        <small style={{ color: '#8d8d8d' }}>We reply within 24 hours.</small>
      </div>
    </form>
  )
}
