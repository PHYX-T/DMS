import { defineStore } from 'pinia'

export interface SystemAuditEntry {
  id: string
  area: 'codes'
  action: 'proposed'|'approved'|'rejected'|'updated'|'deleted'|'imported'|'exported'
  actor: string
  timestamp: string
  details: Record<string, unknown>
}

export const useSystemAuditStore = defineStore('system-audit', {
  state: () => ({ items: [] as SystemAuditEntry[] }),
  actions: {
    append(e: SystemAuditEntry) { this.items.unshift(e) },
    log(area: SystemAuditEntry['area'], action: SystemAuditEntry['action'], actor: string, details: Record<string, unknown> = {}) {
      this.append({ id: String(Date.now()), area, action, actor, timestamp: new Date().toISOString(), details })
    },
    clear() { this.items = [] },
  },
})

