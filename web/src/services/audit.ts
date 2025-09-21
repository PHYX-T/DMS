import type { DocumentID } from '@/types/strict'

export interface AuditAppend { action: string; userId: string; documentId?: DocumentID; context?: Record<string, unknown> }
export interface AuditEntry extends AuditAppend { id: string; timestamp: string }

export const auditService = {
  async append(entry: AuditAppend): Promise<{ ok: true; id: string }> { await new Promise(r => setTimeout(r, 50)); return { ok: true, id: String(Date.now()) } },
  async list(params?: { documentId?: DocumentID; userId?: string; action?: string; from?: string; to?: string }): Promise<AuditEntry[]> { await new Promise(r => setTimeout(r, 120)); return [] },
}

