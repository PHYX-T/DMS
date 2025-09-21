import { defineStore } from 'pinia'
import type { AuditLog } from '@/types/strict'

export const useAuditStore = defineStore('audit', {
  state: () => ({ items: [] as AuditLog[] }),
  actions: { append(entry: AuditLog) { this.items.unshift(entry) }, clear() { this.items = [] } },
})

