import { defineStore } from 'pinia'
import type { DocumentID } from '@/types/strict'
import type { WorkflowState } from '@/utils/workflow'
import { nextStateOnSubmit, nextStateOnApprove, bumpVersion } from '@/utils/workflow'

export interface WorkflowItem {
  id: DocumentID
  title: string
  version: string
  state: WorkflowState
  ownerId: string
  controllerId: string
  minorPolicy: boolean
  slaDueAt: number
}

export interface AuditEvent { id: string; documentId: DocumentID; action: string; userId: string; timestamp: string; details?: Record<string, unknown> }

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    queue: [] as WorkflowItem[],
    audit: new Map<string, AuditEvent[]>(),
    loading: false,
    error: '' as string | null,
  }),
  actions: {
    async refresh() { /* fetch queue from API (mock) */ this.queue = this.queue; return true },

    appendAudit(docId: DocumentID, action: string, userId: string, details?: Record<string, unknown>) {
      const list = this.audit.get(docId) || []
      list.push({ id: `${Date.now()}`, documentId: docId, action, userId, timestamp: new Date().toISOString(), details })
      this.audit.set(docId, list)
    },

    submitDraft(item: WorkflowItem, userId: string, changeSummary: string) {
      item.state = nextStateOnSubmit(item.minorPolicy)
      this.appendAudit(item.id, 'Submitted', userId, { changeSummary })
    },

    approve(item: WorkflowItem, userId: string, comment?: string) {
      const next = nextStateOnApprove(item.state)
      item.state = next
      this.appendAudit(item.id, 'Approved', userId, { comment })
    },

    reject(item: WorkflowItem, userId: string, reason?: string) {
      item.state = 'Rejected'
      this.appendAudit(item.id, 'Rejected', userId, { reason })
    },

    publish(item: WorkflowItem, userId: string) {
      item.state = 'Published'
      const kind = item.minorPolicy ? 'minor' : 'major'
      item.version = bumpVersion(item.version, kind)
      this.appendAudit(item.id, 'Published', userId, { version: item.version })
    },

    escalate(item: WorkflowItem, byUser: string) {
      this.appendAudit(item.id, 'Escalated', byUser, { reason: 'SLA overdue' })
    },
  },
})
