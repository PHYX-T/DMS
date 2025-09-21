import { defineStore } from 'pinia'
import type { Role, User } from '@/types/strict'

export interface AdminUser extends User { lastLogin?: string; status: 'active'|'inactive'; delegation?: { role: Extract<Role,'DocumentOwner'|'DocumentController'>; expiresAt: number; forUserName?: string } }

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [
      { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'Admin', status: 'active', lastLogin: '2025-09-14T10:00:00Z' },
      { id: 'u2', name: 'Bob', email: 'bob@example.com', role: 'DocumentController', status: 'active', lastLogin: '2025-09-15T09:00:00Z' },
      { id: 'u3', name: 'Carol', email: 'carol@example.com', role: 'QMS', status: 'inactive' },
    ] as AdminUser[],
  }),
  actions: {
    invite(email: string) { this.items.push({ id: 'u:' + email, name: email.split('@')[0], email, role: 'EndUser', status: 'active' }) },
    setStatus(id: string, status: 'active'|'inactive') { const u = this.items.find(i => i.id === id); if (u) u.status = status },
    resetPassword(id: string) { /* mock */ },
    setRole(id: string, role: Role) { const u = this.items.find(i => i.id === id); if (u) u.role = role },
    setDelegation(id: string, delegation: AdminUser['delegation']) { const u = this.items.find(i => i.id === id); if (u) u.delegation = delegation },
  },
})

