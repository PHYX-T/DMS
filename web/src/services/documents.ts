import { httpClient } from './httpClient'
import type { Document as Doc, DocumentID } from '@/types/strict'

export interface DocumentSummary { ID: DocumentID; Title: string; Status: Doc['Status']; Version: Doc['Version']; Owner: string; Controller: string; Updated: string }
export interface CreateDraftRequest { ID: DocumentID; Title: string; Metadata: Doc['Metadata'] }

export const documentsService = {
  async getById(id: DocumentID, opts?: { signal?: AbortSignal }): Promise<Doc> {
    await new Promise(r => setTimeout(r, 120))
    return {
      ID: id,
      Title: 'Quality Policy',
      Version: '3.2',
      Status: 'Approved',
      Owner: 'u1',
      Controller: 'u2',
      Metadata: { CompanyCode: 'ABC', SubsidiaryCode: 'HQ', DepartmentCode: 'QMS', DocumentTypeCode: 'PRO', IssueDate: '2025-01-01', ReviewDate: '2026-01-01', Keywords: ['quality'], Description: 'desc', RetentionSchedule: { policy: 'STANDARD', durationMonths: 24, startDate: '2025-01-01' } },
      Files: { PDF: '' },
      ChangeHistory: [],
      RelatedDocuments: [],
    }
  },
  async checkDuplicate(id: DocumentID): Promise<{ duplicate: boolean }> { await new Promise(r => setTimeout(r, 80)); return { duplicate: false } },
  async createDraft(req: CreateDraftRequest): Promise<{ ok: true; id: DocumentID }> { await new Promise(r => setTimeout(r, 200)); return { ok: true, id: req.ID } },
}

