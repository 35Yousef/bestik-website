// Local "fake inbox" for testing: catches every email the app sends.
// SMTP on :1025, web inbox on http://localhost:1080
import { SMTPServer } from 'smtp-server'
import { simpleParser } from 'mailparser'
import http from 'node:http'

const SMTP_PORT = Number(process.env.CATCHER_SMTP_PORT || 1025)
const WEB_PORT = Number(process.env.CATCHER_WEB_PORT || 1080)
const inbox = []

const smtp = new SMTPServer({
  authOptional: true,
  disabledCommands: ['STARTTLS'],
  onAuth(auth, session, cb) { cb(null, { user: auth.username }) },
  onData(stream, session, cb) {
    simpleParser(stream).then((mail) => {
      const item = {
        id: inbox.length + 1,
        at: new Date().toISOString(),
        from: mail.from?.text, to: mail.to?.text, replyTo: mail.replyTo?.text,
        subject: mail.subject, text: mail.text, html: mail.html || '',
      }
      inbox.unshift(item)
      console.log(`📨 [${item.id}] ${item.from} → ${item.to} | ${item.subject}`)
      cb()
    }).catch(cb)
  },
})
smtp.listen(SMTP_PORT, () => console.log(`Mail catcher SMTP listening on :${SMTP_PORT}`))

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
http.createServer((req, res) => {
  if (req.url === '/api/messages') { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(inbox)) }
  const m = req.url.match(/^\/m\/(\d+)/)
  if (m) { const it = inbox.find((x) => x.id === Number(m[1])); res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(it ? it.html || `<pre>${esc(it.text)}</pre>` : 'Not found') }
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(`<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="5"><title>Mail catcher (${inbox.length})</title>
  <body style="font-family:system-ui;background:#111;color:#eee;margin:0;padding:24px"><h1 style="margin:0 0 16px">📬 Mail catcher <small style="color:#888">${inbox.length} emails</small></h1>
  ${inbox.map((i) => `<details style="background:#1c1c1c;border:1px solid #333;border-radius:10px;margin-bottom:10px;padding:12px"><summary style="cursor:pointer"><b>${esc(i.subject)}</b> — <span style="color:#e9b93a">${esc(i.from)}</span> → <span style="color:#e0659f">${esc(i.to)}</span> <small style="color:#888">${i.at}</small></summary>
  <iframe src="/m/${i.id}" style="width:100%;height:560px;border:0;margin-top:10px;background:#fff;border-radius:8px"></iframe></details>`).join('') || '<p style="color:#888">No emails yet — submit the contact form.</p>'}</body>`)
}).listen(WEB_PORT, () => console.log(`Mail catcher inbox → http://localhost:${WEB_PORT}`))
