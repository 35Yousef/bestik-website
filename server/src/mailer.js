import nodemailer from 'nodemailer'

let transporter
export const mailConfigured = () => Boolean(process.env.SMTP_HOST)
export function getTransport() {
  if (transporter) return transporter
  const port = Number(process.env.SMTP_PORT || 587)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    tls: process.env.SMTP_ALLOW_SELF_SIGNED === 'true' ? { rejectUnauthorized: false } : undefined,
  })
  return transporter
}

export const FROM = () => process.env.MAIL_FROM || `"Bestik" <${process.env.SMTP_USER || 'no-reply@bestik.local'}>`

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const nl = (s = '') => esc(s).replace(/\n/g, '<br>')

function layout(title, body) {
  return `<!doctype html><html><body style="margin:0;background:#151515;font-family:Arial,Helvetica,sans-serif;color:#ececec">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#151515;padding:32px 12px"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#1c1c1c;border-radius:14px;overflow:hidden;border:1px solid #2a2a2a">
    <tr><td style="height:6px;background:linear-gradient(90deg,#e0659f,#e9b93a);background-color:#e0659f"></td></tr>
    <tr><td style="padding:28px 32px 8px"><div style="font-size:28px;font-weight:900;letter-spacing:1px;color:#f3f3f3">BEST<span style="color:#e0659f">IK</span></div>
      <div style="font-size:22px;font-weight:800;color:#e9b93a;margin-top:14px;text-transform:uppercase">${esc(title)}</div></td></tr>
    <tr><td style="padding:10px 32px 30px;font-size:15px;line-height:1.65;color:#dcdcdc">${body}</td></tr>
    <tr><td style="background:#e9b93a;color:#121212;padding:14px 32px;font-size:13px;font-weight:700;text-transform:uppercase">Psst!! · Bestik · New Cairo, Egypt</td></tr>
  </table></td></tr></table></body></html>`
}

const row = (k, v) => v ? `<tr><td style="padding:6px 12px 6px 0;color:#9a9a9a;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0;color:#f0f0f0">${nl(v)}</td></tr>` : ''

export function adminNotification(m) {
  return {
    subject: `🐾 New lead: ${m.name} — ${m.service}`,
    replyTo: `"${m.name}" <${m.email}>`,
    text: `New contact form submission\n\nName: ${m.name}\nEmail: ${m.email}\nPhone: ${m.phone || '-'}\nCompany: ${m.company || '-'}\nService: ${m.service}\nBudget: ${m.budget || '-'}\n\n${m.message}\n\nID: ${m.id}`,
    html: layout('New message from the website', `
      <table cellpadding="0" cellspacing="0" style="font-size:14px">${row('Name', m.name)}${row('Email', m.email)}${row('Phone', m.phone)}${row('Company', m.company)}${row('Service', m.service)}${row('Budget', m.budget)}${row('Source', m.source)}</table>
      <div style="margin-top:18px;padding:16px;background:#151515;border-left:4px solid #e0659f;border-radius:6px">${nl(m.message)}</div>
      <p style="margin-top:20px;color:#9a9a9a;font-size:12px">Hit reply to answer ${esc(m.name)} directly, or reply from the dashboard. ID: ${m.id}</p>`),
  }
}

export function autoReply(m) {
  return {
    subject: 'Psst!! Mau got your message 🐾',
    text: `Hi ${m.name},\n\nThanks for reaching out to Bestik! We received your message about "${m.service}" and one of our cats will get back to you within 24 hours.\n\nYour message:\n${m.message}\n\n— The Bestik cats`,
    html: layout(`Hi ${m.name}, we got it!`, `
      <p>Thanks for reaching out to <b style="color:#e0659f">Bestik</b>! We received your message about <b>${esc(m.service)}</b> and one of our cats will get back to you within <b>24 hours</b>.</p>
      <p style="color:#9a9a9a;margin-top:18px">Your message:</p>
      <div style="padding:14px;background:#151515;border-left:4px solid #e9b93a;border-radius:6px">${nl(m.message)}</div>
      <p style="margin-top:22px">— The Bestik cats</p>`),
  }
}

export function replyEmail(m, body, subject) {
  return {
    subject: subject || `Re: Your message to Bestik`,
    text: `${body}\n\n— Bestik\n\n> ${m.message.split('\n').join('\n> ')}`,
    html: layout(`Hi ${m.name}`, `<div>${nl(body)}</div>
      <p style="margin-top:22px">— The Bestik team</p>
      <div style="margin-top:24px;padding-top:14px;border-top:1px solid #2a2a2a;color:#8a8a8a;font-size:13px">On ${new Date(m.createdAt).toLocaleString('en-GB')} you wrote:<br>${nl(m.message)}</div>`),
  }
}

export function testEmail() {
  return { subject: 'Bestik dashboard — SMTP test ✅', text: 'Your SMTP settings work.', html: layout('SMTP test', '<p>If you can read this, your email settings are working. 🐾</p>') }
}

export async function send(to, mail) {
  return getTransport().sendMail({ from: FROM(), to, ...mail })
}
