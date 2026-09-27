// Storage layer with two backends:
//  • Upstash Redis (used automatically on Vercel when KV_REST_API_URL / UPSTASH_REDIS_REST_URL is set)
//  • JSON file (local development / any normal Node server)
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const KEY = process.env.DB_KEY || 'bestik:db'

const defaults = () => ({
  messages: [],
  settings: { autoReply: true, notifyEmail: process.env.ADMIN_EMAIL || '' },
})
const normalize = (s) => ({ ...defaults(), ...(s || {}), settings: { ...defaults().settings, ...(s?.settings || {}) } })

// ---------- backends ----------
let backend
if (REDIS_URL && REDIS_TOKEN) {
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
  backend = {
    name: 'redis',
    async read() { return normalize(await redis.get(KEY)) },
    async write(s) { await redis.set(KEY, s) },
  }
} else {
  const DATA_DIR = path.resolve(process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/bestik' : path.join(import.meta.dirname, '..', 'data')))
  const FILE = path.join(DATA_DIR, 'db.json')
  let cache
  backend = {
    name: 'file',
    async read() {
      if (cache) return cache
      fs.mkdirSync(DATA_DIR, { recursive: true })
      try { cache = normalize(JSON.parse(fs.readFileSync(FILE, 'utf8'))) } catch { cache = defaults() }
      return cache
    },
    async write(s) {
      cache = s
      fs.mkdirSync(DATA_DIR, { recursive: true })
      fs.writeFileSync(FILE + '.tmp', JSON.stringify(s, null, 2))
      fs.renameSync(FILE + '.tmp', FILE)
    },
  }
}

// serialize writes inside one process
let chain = Promise.resolve()
const mutate = (fn) => {
  const run = chain.then(async () => {
    const s = await backend.read()
    const result = fn(s)
    await backend.write(s)
    return result
  })
  chain = run.catch(() => {})
  return run
}

export const db = {
  backend: backend.name,
  async listMessages() { return (await backend.read()).messages },
  async getMessage(id) { return (await backend.read()).messages.find((m) => m.id === id) },
  addMessage(data) {
    return mutate((s) => {
      const msg = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'new', // new | read | replied | archived
        starred: false,
        thread: [],
        mail: { adminNotified: false, autoReplied: false, error: null },
        ...data,
      }
      s.messages.unshift(msg)
      return msg
    })
  },
  updateMessage(id, patch) {
    return mutate((s) => {
      const m = s.messages.find((x) => x.id === id)
      if (!m) return null
      Object.assign(m, typeof patch === 'function' ? patch(m) : patch)
      return m
    })
  },
  deleteMessage(id) {
    return mutate((s) => {
      const n = s.messages.length
      s.messages = s.messages.filter((m) => m.id !== id)
      return s.messages.length !== n
    })
  },
  async getSettings() { return (await backend.read()).settings },
  updateSettings(patch) { return mutate((s) => { Object.assign(s.settings, patch); return s.settings }) },
}
