import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './db.js'
import { send, mailConfigured, adminNotification, autoReply, replyEmail, testEmail, getTransport } from './mailer.js'

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-.env'
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bestik123'

app.set('trust proxy', 1)
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json({ limit: '100kb' }))

// ---------- helpers ----------
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim())
const clean = (s, max = 5000) => String(s ?? '').trim().slice(0, max)
const NO_SMTP = 'Email server not configured (set SMTP_* environment variables)'

function auth(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try { req.user = jwt.verify(token, JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Session expired, please log in again' }) }
}

// ---------- public: contact form ----------
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many messages, please try again later.' } })

app.post('/api/contact', contactLimiter, async (req, res) => {
  const b = req.body || {}
  if (b.website) return res.json({ ok: true }) // honeypot → silently drop bots
  const data = {
    name: clean(b.name, 120), email: clean(b.email, 200).toLowerCase(), phone: clean(b.phone, 40),
    company: clean(b.company, 120), service: clean(b.service, 120), budget: clean(b.budget, 60),
    message: clean(b.message, 5000), source: clean(b.source, 40) || 'website',
  }
  const errors = {}
  if (data.name.length < 2) errors.name = 'Please tell us your name'
  if (!isEmail(data.email)) errors.email = 'Enter a valid email'
  if (!data.service) errors.service = 'Pick a service'
  if (data.message.length < 10) errors.message = 'Message should be at least 10 characters'
  if (Object.keys(errors).length) return res.status(422).json({ error: 'Please fix the highlighted fields.', errors })

  const msg = await db.addMessage({ ...data, ip: req.ip, userAgent: clean(req.headers['user-agent'], 300) })
  const settings = await db.getSettings()
  const to = settings.notifyEmail || process.env.ADMIN_EMAIL
  const mail = { adminNotified: false, autoReplied: false, error: null }
  if (!mailConfigured()) mail.error = NO_SMTP
  else {
    try {
      if (to) { await send(to, adminNotification(msg)); mail.adminNotified = true }
      if (settings.autoReply) { await send(msg.email, autoReply(msg)); mail.autoReplied = true }
    } catch (err) {
      mail.error = err.message
      console.error('[mail] failed:', err.message)
    }
  }
  await db.updateMessage(msg.id, { mail })
  // The message is saved even if email fails, so the lead is never lost.
  res.status(201).json({ ok: true, id: msg.id, mail: { adminNotified: mail.adminNotified, autoReplied: mail.autoReplied } })
})

// ---------- auth ----------
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { error: 'Too many attempts, try later.' } })
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {}
  const okUser = username === ADMIN_USER
  const okPass = ADMIN_PASSWORD.startsWith('$2') ? await bcrypt.compare(String(password || ''), ADMIN_PASSWORD) : password === ADMIN_PASSWORD
  if (!okUser || !okPass) return res.status(401).json({ error: 'Wrong username or password' })
  const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { username } })
})
app.get('/api/auth/me', auth, (req, res) => res.json({ user: { username: req.user.sub } }))

// ---------- admin API ----------
const admin = express.Router()
admin.use(auth)

admin.get('/stats', async (req, res) => {
  const all = await db.listMessages()
  const now = Date.now()
  const day = 864e5
  const byService = {}
  const days = Array.from({ length: 14 }, (_, i) => ({ date: new Date(now - (13 - i) * day).toISOString().slice(0, 10), count: 0 }))
  for (const m of all) {
    byService[m.service] = (byService[m.service] || 0) + 1
    const slot = days.find((d) => d.date === m.createdAt.slice(0, 10))
    if (slot) slot.count++
  }
  res.json({
    total: all.length,
    new: all.filter((m) => m.status === 'new').length,
    replied: all.filter((m) => m.status === 'replied').length,
    last7: all.filter((m) => now - new Date(m.createdAt) < 7 * day).length,
    mailFailures: all.filter((m) => m.mail?.error).length,
    byService: Object.entries(byService).map(([service, count]) => ({ service, count })).sort((a, b) => b.count - a.count),
    days,
    recent: all.slice(0, 5),
    storage: db.backend,
    mailConfigured: mailConfigured(),
  })
})

admin.get('/messages', async (req, res) => {
  const { status = 'all', q = '' } = req.query
  let list = await db.listMessages()
  if (status === 'starred') list = list.filter((m) => m.starred)
  else if (status !== 'all') list = list.filter((m) => m.status === status)
  else list = list.filter((m) => m.status !== 'archived')
  const needle = String(q).toLowerCase().trim()
  if (needle) list = list.filter((m) => [m.name, m.email, m.company, m.message, m.service, m.phone].some((v) => (v || '').toLowerCase().includes(needle)))
  res.json({ messages: list })
})

admin.get('/messages/:id', async (req, res) => {
  let m = await db.getMessage(req.params.id)
  if (!m) return res.status(404).json({ error: 'Not found' })
  if (m.status === 'new') m = await db.updateMessage(m.id, { status: 'read' })
  res.json({ message: m })
})

admin.patch('/messages/:id', async (req, res) => {
  const patch = {}
  const { status, starred, note } = req.body || {}
  if (status && ['new', 'read', 'replied', 'archived'].includes(status)) patch.status = status
  if (typeof starred === 'boolean') patch.starred = starred
  if (typeof note === 'string') patch.note = clean(note, 2000)
  const m = await db.updateMessage(req.params.id, patch)
  if (!m) return res.status(404).json({ error: 'Not found' })
  res.json({ message: m })
})

admin.delete('/messages/:id', async (req, res) => {
  if (!(await db.deleteMessage(req.params.id))) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

admin.post('/messages/:id/reply', async (req, res) => {
  const m = await db.getMessage(req.params.id)
  if (!m) return res.status(404).json({ error: 'Not found' })
  const body = clean(req.body?.body, 10000)
  const subject = clean(req.body?.subject, 200)
  if (body.length < 2) return res.status(422).json({ error: 'Reply is empty' })
  if (!mailConfigured()) return res.status(503).json({ error: NO_SMTP })
  try {
    const info = await send(m.email, replyEmail(m, body, subject))
    const updated = await db.updateMessage(m.id, (cur) => ({
      status: 'replied',
      thread: [...(cur.thread || []), { id: info.messageId, at: new Date().toISOString(), by: req.user.sub, subject: subject || 'Re: Your message to Bestik', body }],
    }))
    res.json({ message: updated })
  } catch (err) {
    res.status(502).json({ error: `Email could not be sent: ${err.message}` })
  }
})

admin.get('/settings', async (req, res) => res.json({
  settings: await db.getSettings(),
  storage: db.backend,
  smtp: { configured: mailConfigured(), host: process.env.SMTP_HOST || '', port: Number(process.env.SMTP_PORT || 587), user: process.env.SMTP_USER || '', from: process.env.MAIL_FROM || '' },
}))
admin.put('/settings', async (req, res) => {
  const { autoReply, notifyEmail } = req.body || {}
  const patch = {}
  if (typeof autoReply === 'boolean') patch.autoReply = autoReply
  if (typeof notifyEmail === 'string') {
    if (notifyEmail && !isEmail(notifyEmail)) return res.status(422).json({ error: 'Invalid notification email' })
    patch.notifyEmail = notifyEmail.trim()
  }
  res.json({ settings: await db.updateSettings(patch) })
})
admin.post('/mail/verify', async (req, res) => {
  if (!mailConfigured()) return res.status(503).json({ ok: false, error: NO_SMTP })
  try { await getTransport().verify(); res.json({ ok: true }) }
  catch (err) { res.status(502).json({ ok: false, error: err.message }) }
})
admin.post('/mail/test', async (req, res) => {
  const to = clean(req.body?.to, 200) || (await db.getSettings()).notifyEmail
  if (!isEmail(to)) return res.status(422).json({ error: 'Enter a valid email' })
  if (!mailConfigured()) return res.status(503).json({ ok: false, error: NO_SMTP })
  try { const info = await send(to, testEmail()); res.json({ ok: true, messageId: info.messageId }) }
  catch (err) { res.status(502).json({ ok: false, error: err.message }) }
})

admin.get('/export.csv', async (req, res) => {
  const cols = ['createdAt', 'status', 'name', 'email', 'phone', 'company', 'service', 'budget', 'message']
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [cols.join(','), ...(await db.listMessages()).map((m) => cols.map((c) => q(m[c])).join(','))].join('\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="bestik-messages.csv"')
  res.send('﻿' + csv)
})

app.use('/api/admin', admin)
app.get('/api/health', (req, res) => res.json({ ok: true, storage: db.backend, mail: mailConfigured() }))
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// async errors → JSON
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

export default app
