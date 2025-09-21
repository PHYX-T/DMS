import { defineStore } from 'pinia'

export type TelemetryKind = 'page' | 'action'
export interface TelemetryEvent { id: string; ts: number; kind: TelemetryKind; name: string; path?: string; meta?: Record<string, unknown> }

const STORAGE_KEY = 'telemetry:events'
const CONSENT_KEY = 'telemetry:consent'

function loadEvents(): TelemetryEvent[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveEvents(events: TelemetryEvent[]) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) } catch {} }

export const useTelemetryStore = defineStore('telemetry', {
  state: () => ({ enabled: false, decided: false, events: [] as TelemetryEvent[] }),
  getters: {
    last30Days: (s) => {
      const cutoff = Date.now() - 30*24*60*60*1000
      return s.events.filter(e => e.ts >= cutoff)
    },
    byDay: (s) => (kind?: TelemetryKind) => {
      const out = new Map<string, number>()
      for (const e of (s as any).last30Days as TelemetryEvent[]) {
        if (kind && e.kind !== kind) continue
        const d = new Date(e.ts); const key = d.toISOString().slice(0,10)
        out.set(key, (out.get(key) || 0) + 1)
      }
      return Array.from(out.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([day,count]) => ({ day, count }))
    },
  },
  actions: {
    init() {
      // consent
      try { const c = localStorage.getItem(CONSENT_KEY); if (c) { this.decided = true; this.enabled = c === 'granted' } } catch {}
      this.events = loadEvents(); this.prune()
    },
    grant() { this.enabled = true; this.decided = true; try { localStorage.setItem(CONSENT_KEY, 'granted') } catch {} },
    deny() { this.enabled = false; this.decided = true; try { localStorage.setItem(CONSENT_KEY, 'denied') } catch {} },
    toggle(v: boolean) { v ? this.grant() : this.deny() },
    prune() { const cutoff = Date.now() - 30*24*60*60*1000; this.events = this.events.filter(e => e.ts >= cutoff); saveEvents(this.events) },
    trackPage(path: string) { if (!this.enabled) return; this.events.unshift({ id: String(Date.now())+Math.random(), ts: Date.now(), kind: 'page', name: 'page_view', path }); this.prune() },
    trackAction(name: string, meta?: Record<string, unknown>) { if (!this.enabled) return; this.events.unshift({ id: String(Date.now())+Math.random(), ts: Date.now(), kind: 'action', name, meta }); this.prune() },
    clear() { this.events = []; saveEvents(this.events) },
  },
})

