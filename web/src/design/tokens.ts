export type ThemeName = 'light' | 'dark' | 'high-contrast'
export type Density = 'comfortable' | 'compact'

export const tokens = {
  color: {
    neutrals: {
      bg: 'var(--bg)',
      surface: 'var(--surface)',
      muted: 'var(--muted)',
      border: 'var(--border)',
      content: 'var(--content)',
      contentMuted: 'var(--content-muted)'
    },
    accent: {
      base: 'var(--accent)',
      s600: 'var(--accent-600)',
      s700: 'var(--accent-700)'
    },
    semantic: {
      ok: 'var(--ok)',
      warn: 'var(--warn)',
      error: 'var(--error)',
      info: 'var(--info)'
    }
  },
  typography: {
    fontSans: 'var(--font-sans)',
    size: {
      xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px',
      h4: '24px', h3: '28px', h2: '32px'
    },
    weight: { regular: 400, medium: 500, semibold: 600 }
  },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  spacing: (n: number) => `${n * 4}px`,
  elevation: {
    e1: '0 0 0 2px color-mix(in hsl, var(--accent), transparent 80%), 0 1px 2px rgba(0,0,0,0.06)',
    e2: '0 1px 2px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.08)',
    e3: '0 2px 4px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.10)',
    e4: '0 6px 12px rgba(0,0,0,0.14), 0 12px 24px rgba(0,0,0,0.18)'
  },
  motion: { fast: '120ms', base: '180ms' }
} as const

const THEME_KEY = 'ui:theme'
const DENSITY_KEY = 'ui:density'

export function applyTheme(theme: ThemeName = 'light', density: Density = 'comfortable') {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.setAttribute('data-density', density)
  try {
    localStorage.setItem(THEME_KEY, theme)
    localStorage.setItem(DENSITY_KEY, density)
  } catch {}
}

export function initTheme() {
  let theme: ThemeName = 'light'
  let density: Density = 'comfortable'
  try {
    const storedTheme = localStorage.getItem(THEME_KEY) as ThemeName | null
    const storedDensity = localStorage.getItem(DENSITY_KEY) as Density | null
    if (storedTheme) theme = storedTheme
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark'
    if (storedDensity) density = storedDensity
  } catch {}
  applyTheme(theme, density)
}
