import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import ContactForm from './ContactForm.jsx'
import { Squiggle, Search, Dots, Pin, Play, Check, Gamepad, Mail, Close, Social, Nav } from './icons.jsx'

const img = (n) => `/img/${n}`
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: .7, ease: [.2, .7, .2, 1] },
}

const SERVICES = [
  { title: 'Content Creation', icon: 'icon-content.png', image: 'svc-scream.webp', items: ['Copywriting', 'Script writing', 'Content calendars', 'Content strategies'] },
  { title: 'Website / Application Developing', icon: 'icon-web.png', image: 'svc-glasses.webp', items: ['Photorealistic visuals', 'Custom 3D designs', 'Multi-platform compatibility', 'Seamless integration'] },
  { title: 'Graphic Designing', icon: 'icon-graphic.png', image: 'svc-group.webp', items: ['Brand identity', 'UI/UX design', 'Marketing materials', 'Custom illustrations', 'Motion graphics'] },
  { title: 'Search Engine Optimization', icon: null, image: 'svc-scream.webp', items: ['Keyword analysis', 'On/Off-page SEO', 'Content optimization', 'Technical SEO', 'Backlink building'] },
]
const TEAM = [
  { name: 'Mostafa Mahmoud', role: 'CEO', img: 'team-mostafa.webp' },
  { name: 'Marwan', role: 'Senior Content Creator', img: 'team-marwan.webp' },
  { name: 'Heraa', role: 'Managing Director', img: 'team-heraa.webp' },
]
const GAMES = [
  { name: 'Super Mau', img: 'game-super.webp' },
  { name: 'Flappy Mau', img: 'game-flappy.webp' },
  { name: 'Dino Mau', img: 'game-dino.webp' },
]
const FAQ = [
  { q: 'About us (Bestik)', a: "Psst! Welcome to MAU'S WORLD! I'm Mau — 27 years old in human years (or just 3 in cat years!). I'm here to share the business tips and motivation I wish I had when I first started out. It wasn't always easy, but I found my way — and now it's your turn to find yours. Along the way, I'll also show you a bit of my life so you can get to know the real me. Let's turn your dreams into reality with endless energy!" },
  { q: 'Kittens world', a: 'As every kitten deserves a chance to grow, we provide students and fresh graduates with opportunities through our monthly internship program. By equipping them with valuable knowledge and involving them in real-life projects, we help them gain insights into the professional work environment and develop both hard and soft skills as a kickstart.' },
  { q: "What is 'How to start' -> what we do", a: "'How to Start' is our free monthly session for founders and small businesses. We break down the basics of branding, content and digital marketing, review real cases live, and after the session attendees are provided with a month of guidance to track their progress and support their growth." },
]
const NAV = [
  { label: 'Home', href: '#home', icon: Nav.home },
  { label: 'Projects', href: '#partner', icon: Nav.projects },
  { label: 'Services', href: '#services', icon: Nav.services },
  { label: 'Team', href: '#team', icon: Nav.team },
  { label: 'Events', href: '#events', icon: Nav.events },
]

function Marquee({ items, reverse }) {
  const row = [...items, ...items, ...items, ...items]
  return (
    <div className={`marquee ${reverse ? 'reverse' : ''}`} aria-hidden="true">
      <div className="marquee-track">
        {row.map((it, i) => <span key={i} className={`marquee-item ${it.cls}`}>{it.text}</span>)}
      </div>
    </div>
  )
}
const PSST = [{ text: 'PSST !!', cls: 'grad-gold' }, { text: 'PSST !!', cls: 'grad-pink' }]

function Header({ onMenu }) {
  const [hide, setHide] = useState(false)
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    let last = 0
    const on = () => {
      const y = window.scrollY
      setHide(y > last && y > 200)
      setSolid(y > 50)
      last = y
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`header ${hide ? 'hide' : ''} ${solid ? 'solid' : ''}`}>
      <div className="container header-inner">
        <a href="#home" className="logo" aria-label="Bestik home"><img src={img('logo.png')} alt="BESTIK" /></a>
        <div className="header-actions">
          <a href="#faq" className="icon-btn" aria-label="Search / FAQ"><Search /></a>
          <button className="icon-btn light" onClick={onMenu} aria-label="Open menu"><Dots /></button>
        </div>
      </div>
    </header>
  )
}

function Hero({ onContact }) {
  return (
    <section className="hero" id="home">
      <motion.h1 className="hero-title" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [.2, .7, .2, 1] }}>
        <span className="l1 grad-pink">Bestik</span>
        <span className="l2 grad-gold">PSST
          <motion.img className="hero-cat" src={img('hero-cat.png')} alt="Mau the cat peeking"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .6, type: 'spring', stiffness: 120 }} />
          !!</span>
      </motion.h1>
      <div className="hero-bottom">
        <div className="container">
          <div>
            <a className="play-pill" href="#racing" aria-label="Play"><Play /></a>
            <div className="loc"><Pin /> New Cairo , Egypt</div>
          </div>
          <button className="contact-mau" onClick={onContact}>CONTACT MAU <img src={img('contact-thumb.png')} alt="" /></button>
        </div>
      </div>
    </section>
  )
}

function Racing() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0.15, 0.85], ['-25vw', '110vw'])
  const rot = useTransform(scrollYProgress, [0, .25, .5, .75, 1], [-8, 8, -8, 8, -8])
  return (
    <section className="racing" id="racing" ref={ref}>
      <div className="racing-sticky gridbg">
        <motion.h2 {...fadeUp}><span className="grad-pink-h" style={{ background: 'linear-gradient(180deg,#e56aa6,#b95a8b)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Racing against</span><span className="time">time</span></motion.h2>
        <motion.img className="racing-clock" src={img('clock.png')} alt="" style={{ x, rotate: rot, left: 0 }} />
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="about container" id="about">
      <motion.h2 className="about-title grad-pink" {...fadeUp}>About the cats....</motion.h2>
      <Squiggle className="squiggle" style={{ width: 300, marginTop: -30 }} />
      <div className="about-grid">
        <motion.img className="about-cat" src={img('about-cat.png')} alt="Mau with a Bestik mug" {...fadeUp} whileHover={{ rotate: -3 }} />
        <motion.div {...fadeUp}>
          <h3 className="pink">Who we are...</h3>
          <p>We are a group of people with a shared dream: to change the marketing mindset in Egypt. We want to help businesses grow, make a positive impact on society, and inspire others through education, creativity, and connection. ✨</p>
          <h3 className="gold">Wanna play with cats!</h3>
          <p>Bestik will help you throw the journey, by using our creative and strategic ways AKA <span className="bestik-ways">the Bestik ways</span></p>
        </motion.div>
      </div>
    </section>
  )
}

function Partner() {
  return (
    <section className="partner" id="partner">
      <img className="badge" src={img('badge.png')} alt="" />
      <motion.img className="peek-side" src={img('peek-side.png')} alt="" initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring' }} />
      <div className="container">
        <motion.h2 className="grad-pink" {...fadeUp}>Your partner in creative impact</motion.h2>
        <motion.p className="partner-lead" {...fadeUp}>We've seen with our own eyes through our seven lives the game-changing force of marketing and adjusted our tactics to accommodate the changing demands. <em>Here's a glimpse of what we do:</em></motion.p>
        <motion.img className="collage" src={img('collage.webp')} alt="Content creation, business development, branding, SEO, CGI, app and web experience, digital marketing" {...fadeUp} />
        <a href="#services" className="btn-gold" style={{ marginTop: 10 }}>View projects</a>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section className="process container">
      <motion.div className="process-title" {...fadeUp}>
        <img className="cat" src={img('hero-cat.png')} alt="" />
        <h2 className="grad-pink">Welcome to the work process</h2>
        <img className="badge" src={img('badge.png')} alt="" />
        <Squiggle className="squiggle" style={{ width: 110, margin: '-10px auto 0 55%' }} />
      </motion.div>
      <motion.p {...fadeUp}>Our process <span className="pink" style={{ fontFamily: 'var(--f-heavy)', fontWeight: 400 }}>at Bestik</span> combines creativity <span className="pink" style={{ fontFamily: 'var(--f-heavy)', fontWeight: 400 }}>with strategy</span>, starting with <span className="pink" style={{ fontFamily: 'var(--f-heavy)', fontWeight: 400 }}>understanding</span></motion.p>
    </section>
  )
}

function Services() {
  return (
    <section className="services container" id="services">
      <div className="services-head">
        <motion.h2 {...fadeUp}><span style={{ color: '#f3f3f3' }}>Our</span><br /><span className="grad-gold">Services</span></motion.h2>
        <img className="cat" src={img('hero-cat.png')} alt="" />
        <Squiggle className="squiggle" style={{ width: 170 }} />
      </div>
      <div className="services-body">
        <div className="svc-images">
          {SERVICES.map((s, i) => <div className="svc-img" key={i} style={{ top: 110 + i * 14 }}><img src={img(s.image)} alt={s.title} loading="lazy" /></div>)}
        </div>
        <div className="svc-cards">
          {SERVICES.map((s, i) => (
            <div className="svc-card" key={i} style={{ top: 110 + i * 14 }}>
              <div className="mobile-img"><img src={img(s.image)} alt="" loading="lazy" /></div>
              <motion.div className="svc-card-inner" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="svc-card-head">
                  {s.icon ? <img src={img(s.icon)} alt="" /> : (
                    <div className="svc-icon-seo"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#e9b93a" strokeWidth="2"><circle cx="10" cy="10" r="6" /><path d="m20 20-5.5-5.5" /><path d="M7 11l2-2 2 2 2-3" stroke="#e0659f" /></svg></div>
                  )}
                  <h3 className="grad-gold">{s.title}</h3>
                  <Squiggle />
                </div>
                <ul>{s.items.map((it) => <li key={it}><Check />{it}</li>)}</ul>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Events() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const r1 = useTransform(scrollYProgress, [0, .45], [-110, 0])
  const r2 = useTransform(scrollYProgress, [.1, .6], [-110, 0])
  const r3 = useTransform(scrollYProgress, [.2, .75], [-110, 0])
  const r4 = useTransform(scrollYProgress, [.3, .9], [-110, 0])
  return (
    <section id="events">
      <div className="container events-head">
        <div className="ttl">
          <img className="cat" src={img('hero-cat.png')} alt="" />
          <motion.h2 className="grad-pink" {...fadeUp}>Cats life &amp; events</motion.h2>
        </div>
        <a href="#contact" className="btn-gold" style={{ marginBottom: 14 }}>See the latest events</a>
      </div>
      <div className="impact gridbg" ref={ref}>
        <motion.span className="line l1 grad-gold" style={{ rotateX: r1 }}>Making</motion.span>
        <motion.span className="line l2 grad-gold" style={{ rotateX: r2 }}>A positive</motion.span>
        <motion.span className="line l3" style={{ rotateX: r3 }}>Difference</motion.span>
        <motion.span className="line l4 grad-gold" style={{ rotateX: r4 }}>In the community</motion.span>
      </div>
    </section>
  )
}

function Team() {
  return (
    <section className="team" id="team">
      <Marquee items={[{ text: 'Meet the team', cls: 'grad-pink' }, { text: 'Meet the cats', cls: '' }]} />
      <div className="container">
        <div className="team-head">
          <div className="ttl">
            <img className="cat" src={img('hero-cat.png')} alt="" />
            <motion.h2 className="grad-pink" {...fadeUp}>Meet the cats</motion.h2>
            <Squiggle className="squiggle" style={{ width: 180, margin: '-8px 0 0 120px' }} />
          </div>
          <div>
            <p>Bestik's cats are here to make an impact!<br />Click the link to meet the cats</p>
            <a href="#team-grid" className="btn-gold">View team</a>
          </div>
        </div>
        <svg className="crown" viewBox="0 0 120 50" fill="#e9b93a"><path d="M10 45 L20 12 L42 30 L60 4 L78 30 L100 12 L110 45 Z" /><path d="M2 6 18 20M118 6 102 20" stroke="#e9b93a" strokeWidth="5" strokeLinecap="round" /></svg>
        <div className="team-grid" id="team-grid">
          {TEAM.map((m, i) => (
            <motion.div className="member" key={m.name} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .12 }}>
              <div className="member-photo"><img src={img(m.img)} alt={m.name} loading="lazy" /><span className="member-tag">{m.role}</span></div>
              <div className="name-bar">{m.name}<Squiggle /><span className="ig"><Social.instagram /></span></div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`.team .marquee-item:not(.grad-pink){background:linear-gradient(180deg,#5b3bd0,#2d1b6b);-webkit-background-clip:text;background-clip:text;color:transparent}.name-bar .ig svg{width:16px;height:16px}`}</style>
    </section>
  )
}

function Ceo() {
  return (
    <section className="container ceo">
      <motion.div {...fadeUp}>
        <blockquote>As one team, we aim to build strong, sustainable community, Through our work.<br />Our goal is to ensure that people enjoy our message and also makes a positive impact on both businesses and the community.</blockquote>
        <img className="sig" src={img('signature.png')} alt="Mostafa signature" />
      </motion.div>
      <div className="ceo-right">
        <motion.h2 {...fadeUp}>Voice of CE-YO.</motion.h2>
        <img className="ceo-photo" src={img('ceo.webp')} alt="Mostafa Mahmoud, CEO" />
      </div>
    </section>
  )
}

function Arcade() {
  return (
    <section className="arcade container" id="arcade">
      <motion.h2 {...fadeUp}>
        <span className="pss">PSS<img className="flyer" src={img('hero-cat.png')} alt="" />T!!!</span>
        <Squiggle className="squiggle scribble" /><br />
        Bestik arcade<br />Play our recreated<br />games with our<br />beloved Mau.
      </motion.h2>
      <div className="games">
        {GAMES.map((g, i) => (
          <motion.a href="#contact" className="game-card" key={g.name} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .12 }}>
            <div className="shot"><img src={img(g.img)} alt={g.name} loading="lazy" /><span>BESTIK GAMES</span></div>
            <div className="name-bar">{g.name}<Squiggle /><span className="ig"><Gamepad /></span></div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="container faq" id="faq">
      <div>
        <h2>Frequently<br />asked questions</h2>
        <Squiggle className="squiggle" style={{ width: 120, marginLeft: 90 }} />
      </div>
      <div>
        {FAQ.map((f, i) => (
          <div className={`faq-item ${open === i ? 'open' : ''}`} key={i}>
            <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{f.q}<span className="pm">+</span></button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div className="faq-a" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
                  <p>{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact container" id="contact">
      <motion.div className="contact-wrap" {...fadeUp}>
        <div>
          <h2><span className="grad-pink">Say psst</span><br /><span className="grad-gold">to Mau!!</span></h2>
          <p className="lead">Got a brand that needs nine lives? Tell us what you're building and one of our cats will get back to you within 24 hours.</p>
          <div className="contact-info">
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Pin /> New Cairo , Cairo , Egypt</span>
          </div>
          <img className="cat" src={img('about-cat.png')} alt="" />
        </div>
        <ContactForm source="contact-section" />
      </motion.div>
    </section>
  )
}

function Footer({ onContact }) {
  return (
    <footer className="footer container">
      <div className="footer-card">
        <div className="footer-top"><span>Psst !!</span><button onClick={onContact}>Contact us <span className="mail"><Mail /></span></button></div>
        <div className="footer-mid">
          <div>
            <h2>Mewo with us<img src={img('hero-cat.png')} alt="" /></h2>
            <div className="socials">
              {Object.entries(Social).map(([k, C]) => <a key={k} href="#" aria-label={k}><C /></a>)}
            </div>
          </div>
          <div>
            <div className="hq"><span>H.Q.</span><span>New Cairo , Cairo , Egypt</span></div>
            <nav className="foot-nav">{NAV.map(({ label, href, icon: I }) => <a key={label} href={href}><I />{label}</a>)}</nav>
          </div>
        </div>
        <div className="footer-bottom"><span>© Bestik Designs {new Date().getFullYear()}</span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Go back to top</button></div>
      </div>
    </footer>
  )
}

export default function Site() {
  const [menu, setMenu] = useState(false)
  const [modal, setModal] = useState(false)
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && (setMenu(false), setModal(false))
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  return (
    <>
      <div className="grain" />
      <Header onMenu={() => setMenu(true)} />
      <main>
        <Hero onContact={() => setModal(true)} />
        <Racing />
        <About />
        <Marquee items={PSST} />
        <Partner />
        <Process />
        <Marquee items={PSST} reverse />
        <Services />
        <Events />
        <Team />
        <Ceo />
        <Arcade />
        <Faq />
        <Contact />
      </main>
      <Footer onContact={() => setModal(true)} />

      <AnimatePresence>
        {menu && (
          <motion.div className="menu-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="icon-btn light menu-close" onClick={() => setMenu(false)} aria-label="Close menu"><Close /></button>
            {NAV.map((n, i) => (
              <motion.a key={n.label} href={n.href} onClick={() => setMenu(false)} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * .06 }} className={i % 2 ? 'gold' : 'pink'}>{n.label}</motion.a>
            ))}
            <motion.a href="#contact" onClick={() => setMenu(false)} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: .35 }}>Contact</motion.a>
          </motion.div>
        )}
        {modal && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && setModal(false)}>
            <motion.div className="modal" initial={{ y: 40, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }} role="dialog" aria-modal="true" aria-label="Contact Mau">
              <button className="close" onClick={() => setModal(false)} aria-label="Close"><Close /></button>
              <h3><span className="grad-pink">Contact</span> <span className="grad-gold">Mau</span></h3>
              <ContactForm source="contact-modal" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
