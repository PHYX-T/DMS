import type { DocumentID } from '@/types/strict'
import type { WorkflowState } from '@/utils/workflow'

export interface QueueItem { id: DocumentID; title: string; version: string; state: WorkflowState; ownerId: string; controllerId: string; minorPolicy: boolean; slaDueAt: number }

export const workflowService = {
  async listQueue(): Promise<QueueItem[]> { await new Promise(r => setTimeout(r, 120)); return [] },
  async submit(id: DocumentID, summary: string): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 120)); return { ok: true } },
  async approve(id: DocumentID, comment?: string): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 120)); return { ok: true } },
  async reject(id: DocumentID, reason?: string): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 120)); return { ok: true } },
  async publish(id: DocumentID): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 120)); return { ok: true } },
}

