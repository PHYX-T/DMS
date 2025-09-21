// Specs-Kit v2.0 – strict document and audit types

export type DocStatus = 'Draft' | 'Review' | 'Approved' | 'Archived' | 'Obsolete'
export type Version = `${number}.${number}`

// AAA-BB-CCC-DDD-XXX (XXX numeric)
export type DocumentID = `${Uppercase<string>}-${Uppercase<string>}-${Uppercase<string>}-${Uppercase<string>}-${number}`

export type Role = 'EndUser' | 'DocumentOwner' | 'DocumentController' | 'QMS' | 'Admin' | 'ExternalAuditor'

export interface User { id: string; name: string; email: string; role: Role }

export interface RetentionSchedule {
  // WORM note: when policy is 'WORM', audit is append-only (no edits/deletes)
  policy: 'WORM' | 'STANDARD'
  durationMonths: number // >= 0
  startDate?: string // ISO date (usually IssueDate)
}

export interface Metadata {
  CompanyCode: string
  SubsidiaryCode: string
  DepartmentCode: string
  DocumentTypeCode: string
  IssueDate: string // ISO date
  ReviewDate: string // ISO date
  Keywords: string[]
  Description: string
  RetentionSchedule: RetentionSchedule
}

export interface FilesRef { PDF: string; Source?: string }

export interface ChangeLogEntry {
  version: Version
  action: 'Created' | 'Revised' | 'Approved' | 'Archived' | 'Accessed'
  userId: string
  timestamp: string // ISO datetime
  notes?: string
}

export interface Document {
  ID: DocumentID
  Title: string
  Version: Version
  Status: DocStatus
  Owner: string
  Controller: string
  Metadata: Metadata
  Files: FilesRef
  ChangeHistory: ChangeLogEntry[]
  RelatedDocuments?: DocumentID[]
}

export interface AuditLog {
  id: string
  documentId: DocumentID
  action: ChangeLogEntry['action']
  userId: string
  timestamp: string
  details?: Record<string, unknown>
}

export interface CodeList {
  CompanyCodes: string[]
  SubsidiaryCodes: string[]
  DepartmentCodes: string[]
  DocumentTypeCodes: string[]
}

