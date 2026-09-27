export const Squiggle = ({ className = 'squiggle', style }) => (
  <svg className={className} style={style} viewBox="0 0 160 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 36 L22 10 L24 30 L38 12 L40 30 L54 14 L56 30 L70 16 L72 28 C95 22 125 12 156 4" />
  </svg>
)
export const Search = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)
export const Dots = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><circle cx="8" cy="12" r=".6" fill="currentColor" /><circle cx="12" cy="12" r=".6" fill="currentColor" /><circle cx="16" cy="12" r=".6" fill="currentColor" /></svg>
)
export const Pin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
)
export const Play = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg>)
export const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>
)
export const Gamepad = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="11" rx="4" /><path d="M8 11v3M6.5 12.5h3" /><circle cx="16" cy="12" r=".8" fill="currentColor" /><circle cx="18" cy="14" r=".8" fill="currentColor" /></svg>
)
export const Mail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
)
export const Close = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6 6 18" /></svg>
)
const s = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }
export const Social = {
  instagram: () => (<svg {...s}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>),
  tiktok: () => (<svg {...s}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 3 2.5 5 5.5 5" /></svg>),
  behance: () => (<svg {...s}><circle cx="12" cy="12" r="9" /><path d="M8 9h3a1.5 1.5 0 0 1 0 3H8zm0 3h3.5a1.5 1.5 0 0 1 0 3H8z" /></svg>),
  linkedin: () => (<svg {...s}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></svg>),
  youtube: () => (<svg {...s}><rect x="2.5" y="6" width="19" height="12" rx="4" /><path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" /></svg>),
}
export const Nav = {
  home: () => (<svg {...s} width="18" height="18"><path d="M3 11 12 4l9 7v9H3z" /><path d="M9 20v-6h6v6" /></svg>),
  projects: () => (<svg {...s} width="18" height="18"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18" /></svg>),
  services: () => (<svg {...s} width="18" height="18"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></svg>),
  team: () => (<svg {...s} width="18" height="18"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18a6 6 0 0 1 11 0" /></svg>),
  events: () => (<svg {...s} width="18" height="18"><path d="M4 20 20 4M14 4h6v6" /></svg>),
}
