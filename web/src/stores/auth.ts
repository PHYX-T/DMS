import { defineStore } from 'pinia'
import type { Role, User } from '@/types/strict'

type Delegation = { role: Extract<Role, 'DocumentOwner' | 'DocumentController'>; expiresAt: number; forUserName?: string } | null

interface State {
  token: string | null
  role: Role
  user: User | null
  // session
  sessionExpiresAt: number | null
  lastActivityAt: number | null
  idleWarning: boolean
  warningDeadlineAt: number | null
  // delegation (set by Admin via backend; displayed in profile)
  delegation: Delegation
}

const STORAGE_KEY = 'auth:state'
const DEVICES_KEY = 'auth:devices'
const SESSION_DURATION_MS = 60 * 60 * 1000 // 60 minutes
const REFRESH_THRESHOLD_MS = 10 * 60 * 1000 // refresh if <10m remaining
const IDLE_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes idle
const IDLE_WARNING_MS = 60 * 1000 // show warning for 60s before logout

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    token: null,
    role: 'EndUser',
    user: null,
    sessionExpiresAt: null,
    lastActivityAt: null,
    idleWarning: false,
    warningDeadlineAt: null,
    delegation: null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    effectiveRole: (s): Role => {
      const now = Date.now()
      if (s.delegation && s.delegation.expiresAt > now) return s.delegation.role
      return s.role
    },
    timeToExpiry: (s): number | null => (s.sessionExpiresAt ? s.sessionExpiresAt - Date.now() : null),
    timeToIdleCutoff: (s): number | null => {
      if (!s.lastActivityAt) return null
      return s.lastActivityAt + IDLE_TIMEOUT_MS - Date.now()
    },
  },
  actions: {
    setRole(role: Role) { this.role = role; this.persist() },
    setDelegation(delegation: Delegation) { this.delegation = delegation; this.persist() },

    signInPassword(email: string, _password: string) {
      const role = this.role || 'EndUser'
      const user: User = { id: 'u:' + email, name: email.split('@')[0] || 'User', email, role }
      this.startSession('mock-token', user)
    },

    async signInSSO() {
      // SSO stub: in reality redirect to Microsoft OAuth; here we mock
      const email = 'user@example.com'
      const role = this.role || 'EndUser'
      const user: User = { id: 'sso:user', name: 'SSO User', email, role }
      this.startSession('sso-mock-token', user)
    },

    startSession(token: string, user: User) {
      this.token = token
      this.user = user
      this.role = user.role
      this.sessionExpiresAt = Date.now() + SESSION_DURATION_MS
      this.lastActivityAt = Date.now()
      this.idleWarning = false
      this.warningDeadlineAt = null
      this.persist()
      this.trackDevice()
    },

    signOut() {
      this.token = null
      this.user = null
      this.sessionExpiresAt = null
      this.lastActivityAt = null
      this.idleWarning = false
      this.warningDeadlineAt = null
      this.delegation = null
      this.persist()
    },

    persist() {
      try {
        const { token, role, user, sessionExpiresAt, lastActivityAt, delegation } = this
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, role, user, sessionExpiresAt, lastActivityAt, delegation }))
      } catch {}
    },

    restore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const data = JSON.parse(raw)
        this.token = data.token
        this.role = data.role
        this.user = data.user
        this.sessionExpiresAt = data.sessionExpiresAt
        this.lastActivityAt = data.lastActivityAt
        this.delegation = data.delegation ?? null
        if (!this.token || !this.sessionExpiresAt || this.sessionExpiresAt < Date.now()) {
          this.signOut(); return
        }
        // Refresh session if nearing expiry
        if (this.sessionExpiresAt - Date.now() < REFRESH_THRESHOLD_MS) this.refresh()
      } catch {}
    },

    refresh() {
      if (!this.token) return
      // Mock refresh: extend expiry
      this.sessionExpiresAt = Date.now() + SESSION_DURATION_MS
      this.persist()
    },

    startIdleTracking() {
      const onActivity = () => this.recordActivity()
      ;['mousemove','keydown','scroll','click','touchstart'].forEach(evt => window.addEventListener(evt, onActivity, { passive: true }))
      // Periodic checker
      const tick = () => {
        if (!this.token) return
        const now = Date.now()
        const idleCutoff = (this.lastActivityAt ?? now) + IDLE_TIMEOUT_MS
        if (!this.idleWarning && now >= idleCutoff - IDLE_WARNING_MS) {
          this.idleWarning = true
          this.warningDeadlineAt = idleCutoff
        }
        if (now >= idleCutoff) {
          this.signOut()
        }
        if (this.sessionExpiresAt && now >= this.sessionExpiresAt - REFRESH_THRESHOLD_MS) {
          this.refresh()
        }
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    },

    recordActivity() {
      if (!this.token) return
      this.lastActivityAt = Date.now()
      if (this.idleWarning) { this.idleWarning = false; this.warningDeadlineAt = null }
      this.persist()
    },

    trackDevice() {
      try {
        const devices = JSON.parse(localStorage.getItem(DEVICES_KEY) || '[]') as { id: string; ua: string; lastSeen: number }[]
        const ua = navigator.userAgent
        const id = btoa(ua).slice(0, 12)
        const now = Date.now()
        const existing = devices.find(d => d.id === id)
        if (existing) existing.lastSeen = now
        else devices.push({ id, ua, lastSeen: now })
        localStorage.setItem(DEVICES_KEY, JSON.stringify(devices))
      } catch {}
    },

    listDevices(): { id: string; ua: string; lastSeen: number }[] {
      try { return JSON.parse(localStorage.getItem(DEVICES_KEY) || '[]') } catch { return [] }
    },
  },
})
