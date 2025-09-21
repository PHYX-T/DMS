import { DOC_ID_REGEX } from '@/utils/regex'
import type { DocumentID, Metadata, RetentionSchedule, DocStatus, AuditLog } from '@/types/document'

export { DOC_ID_REGEX }

export type ValidationResult = { ok: true } | { ok: false; error: string }

export function validateDocId(id: string): ValidationResult {
  if (!id) return { ok: false, error: 'Document ID is required' }
  if (!DOC_ID_REGEX.test(id)) return { ok: false, error: 'Invalid Document ID format' }
  return { ok: true }
}

export function validateDates(issueDate: string, reviewDate: string): ValidationResult {
  const isISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)
  if (!isISO(issueDate)) return { ok: false, error: 'IssueDate must be ISO date (YYYY-MM-DD)' }
  if (!isISO(reviewDate)) return { ok: false, error: 'ReviewDate must be ISO date (YYYY-MM-DD)' }
  const i = new Date(issueDate).getTime()
  const r = new Date(reviewDate).getTime()
  if (Number.isNaN(i) || Number.isNaN(r)) return { ok: false, error: 'Invalid date(s)' }
  if (r < i) return { ok: false, error: 'ReviewDate must be on or after IssueDate' }
  return { ok: true }
}

export function validateKeywords(keywords: string[]): ValidationResult {
  if (!Array.isArray(keywords)) return { ok: false, error: 'Keywords must be an array' }
  if (keywords.length > 32) return { ok: false, error: 'Too many keywords (max 32)' }
  for (const k of keywords) {
    if (typeof k !== 'string' || !k.trim()) return { ok: false, error: 'Keywords must be non-empty strings' }
    if (k.length > 64) return { ok: false, error: 'Keyword too long (max 64 chars)' }
  }
  return { ok: true }
}

export function validateRetention(ret: RetentionSchedule): ValidationResult {
  if (!ret) return { ok: false, error: 'RetentionSchedule is required' }
  if (ret.policy !== 'WORM' && ret.policy !== 'STANDARD') return { ok: false, error: 'Invalid retention policy' }
  if (!Number.isFinite(ret.durationMonths) || ret.durationMonths < 0) return { ok: false, error: 'durationMonths must be >= 0' }
  if (ret.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(ret.startDate)) return { ok: false, error: 'startDate must be ISO date (YYYY-MM-DD)' }
  return { ok: true }
}

export function validateMetadata(meta: Metadata): ValidationResult {
  const required = ['CompanyCode','SubsidiaryCode','DepartmentCode','DocumentTypeCode','IssueDate','ReviewDate','Description'] as const
  for (const key of required) {
    if (!(key in meta) || !(meta as any)[key]) return { ok: false, error: `${key} is required` }
  }
  const dates = validateDates(meta.IssueDate, meta.ReviewDate)
  if (!dates.ok) return dates
  const keywords = validateKeywords(meta.Keywords)
  if (!keywords.ok) return keywords
  const retention = validateRetention(meta.RetentionSchedule)
  if (!retention.ok) return retention
  return { ok: true }
}

export async function checkDuplicateId(
  id: string,
  exists: (id: DocumentID) => Promise<boolean>
): Promise<ValidationResult> {
  const fmt = validateDocId(id)
  if (!fmt.ok) return fmt
  const dup = await exists(id as DocumentID)
  if (dup) return { ok: false, error: 'Duplicate Document ID' }
  return { ok: true }
}

// WORM helper: audit must be append-only (no removals, no in-place edits)
export function isAppendOnly(prev: AuditLog[], next: AuditLog[]): boolean {
  if (prev.length > next.length) return false
  for (let i = 0; i < prev.length; i++) {
    const a = prev[i]
    const b = next[i]
    if (!b) return false
    if (JSON.stringify(a) !== JSON.stringify(b)) return false
  }
  return true
}

