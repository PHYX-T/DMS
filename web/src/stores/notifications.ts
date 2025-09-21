import { defineStore } from 'pinia'

export type NotificationType = 'review_due' | 'approval_pending' | 'publish_success' | 'publish_failure' | 'upcoming_expiry' | 'delegation' | 'info'
export type NotificationLevel = 'info' | 'warn' | 'error'

export interface NotificationItem {
  id: string
  type: NotificationType
  text: string
  level: NotificationLevel
  read: boolean
  timestamp: number
}

type Digest = 'off' | 'daily' | 'weekly'

const PREFS_KEY = 'notify:prefs'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [] as NotificationItem[],
    prefs: { digest: 'off' as Digest, time: '09:00' },
    _timer: null as number | null,
  }),
  getters: {
    unreadCount: (s) => s.items.filter(i => !i.read).length,
    filtered: (s) => (type?: NotificationType) => !type ? s.items : s.items.filter(i => i.type === type),
  },
  actions: {
    push(text: string, level: NotificationLevel = 'info') {
      // Back-compat convenience
      this.pushType('info', text, level)
    },
    pushType(type: NotificationType, text: string, level?: NotificationLevel) {
      const lvl: NotificationLevel = level ?? (type === 'publish_failure' ? 'error' : type === 'review_due' || type === 'upcoming_expiry' ? 'warn' : 'info')
      this.items.unshift({ id: String(Date.now()) + Math.random().toString(16).slice(2), type, text, level: lvl, read: false, timestamp: Date.now() })
    },
    markRead(id: string) { const it = this.items.find(i => i.id === id); if (it) it.read = true },
    markAllRead() { this.items.forEach(i => i.read = true) },
    remove(id: string) { this.items = this.items.filter(n => n.id !== id) },
    clear() { this.items = [] },

    setDigest(digest: Digest, time: string = '09:00') {
      this.prefs.digest = digest; this.prefs.time = time; this.persist()
      // If offline, queue for later server sync; here we just log
      if (!navigator.onLine) {
        try { const q = JSON.parse(localStorage.getItem('notify:queue') || '[]'); q.push({ name: 'setDigest', payload: this.prefs }); localStorage.setItem('notify:queue', JSON.stringify(q)) } catch {}
      }
    },
    loadPrefs() { try { const raw = localStorage.getItem(PREFS_KEY); if (raw) this.prefs = JSON.parse(raw) } catch {} },
    persist() { try { localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs)) } catch {} },

    sendTest() {
      this.pushType('approval_pending', 'Test: Approval pending for Quality Policy')
      this.pushType('review_due', 'Test: Review due in 3 days for Safety Policy')
    },

    // Long-poll / mock SSE
    startStream() {
      if (this._timer) return
      this._timer = window.setInterval(() => {
        if (!document.hasFocus()) return
        const types: NotificationType[] = ['review_due','approval_pending','publish_success','publish_failure','upcoming_expiry','delegation']
        const t = types[Math.floor(Math.random()*types.length)]
        const text = t.replace('_',' ') + ' (demo)'
        this.pushType(t, text)
      }, 30000) // every 30s demo
    },
    stopStream() { if (this._timer) { clearInterval(this._timer); this._timer = null } },
  },
})
