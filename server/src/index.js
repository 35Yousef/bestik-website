// Local / VPS entry point. On Vercel, /api/index.js imports app.js directly.
import path from 'node:path'
import fs from 'node:fs'
import express from 'express'
import app from './app.js'
import { db } from './db.js'
import { mailConfigured } from './mailer.js'

const PORT = Number(process.env.PORT || 5000)

// serve the built React app
const dist = path.resolve(import.meta.dirname, '..', '..', 'client', 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '7d', index: false }))
  app.get(['/', '/*splat'], (req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`Bestik server running → http://localhost:${PORT}  (storage: ${db.backend})`)
  if (!mailConfigured()) console.log('⚠  SMTP_HOST not set — emails are skipped. Fill server/.env or run "npm run mail-catcher".')
})
