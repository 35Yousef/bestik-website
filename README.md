# BESTIK — React + Node.js website with dashboard

Site rebuilt from the Framer screen recording (all sections: hero, Racing Against Time, About the cats, Partner in creative impact, Work process, Services, Cats life & events, Meet the cats, Voice of CE-YO, Arcade, FAQ, footer) + a working contact form + an admin dashboard.

```
bestik/
├─ client/   React (Vite) — website at /  and dashboard at /admin
└─ server/   Node.js (Express) — API, email sending, JSON database
```

## التشغيل بسرعة (Quick start)

Requires **Node.js 20.11+**.

```bash
cd bestik
npm run setup        # installs root + server + client
npm run dev          # API :5000 + website :5173 + mail catcher :1080
```

- Website → http://localhost:5173
- Dashboard → http://localhost:5173/admin  (user `admin` / pass `bestik123` — change in `server/.env`)
- Test inbox (catches every email the app sends) → http://localhost:1080

Submit the form on the site → you'll see 2 emails in the test inbox (lead notification to you + confirmation to the visitor) and the message in the dashboard. Reply from the dashboard → a 3rd email is sent to the visitor.

## Sending real emails (Gmail / Hostinger)

Edit `server/.env` (examples are inside it), e.g. Gmail:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=yourname@gmail.com
SMTP_PASS=your-16-char-app-password     # Google Account → Security → App passwords
MAIL_FROM="Bestik" <yourname@gmail.com>
ADMIN_EMAIL=where-leads-should-go@gmail.com
```

Restart the server, open **Dashboard → Settings** → *Check connection* → *Send test email*.

## Production

```bash
npm run build     # builds React into client/dist
npm start         # Express serves the site + API on PORT (default 5000)
```

Deploy on any Node host (Hostinger VPS, Render, Railway…). Set a strong `JWT_SECRET` and `ADMIN_PASSWORD` (plain text or a bcrypt hash starting with `$2`).

## API

| Method | Path | |
|---|---|---|
| POST | `/api/contact` | public form (validation, honeypot, rate limit 10/15 min) |
| POST | `/api/auth/login` | returns JWT |
| GET | `/api/admin/stats` | dashboard KPIs |
| GET | `/api/admin/messages?status=&q=` | list / search |
| GET/PATCH/DELETE | `/api/admin/messages/:id` | read, star, archive, delete |
| POST | `/api/admin/messages/:id/reply` | email reply to the visitor |
| GET/PUT | `/api/admin/settings` | notification email, auto-reply toggle |
| POST | `/api/admin/mail/verify`, `/api/admin/mail/test` | SMTP check |
| GET | `/api/admin/export.csv` | export leads |

Messages are stored in `server/data/db.json` and are saved even if email fails, so no lead is lost.
