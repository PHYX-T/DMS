import { httpClient } from './httpClient'
import type { Role, User } from '@/types/strict'

export interface InviteRequest { email: string }
export interface UserRecord extends User { lastLogin?: string; status: 'active'|'inactive' }

export const usersService = {
  async list(opts?: { signal?: AbortSignal }): Promise<UserRecord[]> {
    await new Promise(r => setTimeout(r, 120))
    return [ { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'Admin', status: 'active', lastLogin: '2025-09-10T10:00:00Z' } ]
  },
  async invite(req: InviteRequest): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 80)); return { ok: true } },
  async setRole(id: string, role: Role): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 80)); return { ok: true } },
  async setStatus(id: string, status: 'active'|'inactive'): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 80)); return { ok: true } },
  async resetPassword(id: string): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 80)); return { ok: true } },
}

