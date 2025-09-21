import { describe, it, expect } from 'vitest'
import { DOC_ID_REGEX, validateDocId, validateDates, validateKeywords, validateRetention, validateMetadata, checkDuplicateId, isAppendOnly } from './validation'
import type { Metadata, RetentionSchedule, AuditLog } from '@/types/document'

describe('DOC_ID_REGEX', () => {
  it('accepts valid IDs', () => {
    expect(DOC_ID_REGEX.test('ABC-XY-ENG-PRO-001')).toBe(true)
    expect(DOC_ID_REGEX.test('QMS-AA-OPS-DOC-123')).toBe(true)
  })
  it('rejects invalid IDs', () => {
    expect(DOC_ID_REGEX.test('abc-xy-eng-pro-001')).toBe(false)
    expect(DOC_ID_REGEX.test('AB-XYZ-ENG-PRO-001')).toBe(false)
    expect(DOC_ID_REGEX.test('ABC-XY-ENG-001')).toBe(false)
  })
})

describe('validateDocId', () => {
  it('validates format', () => {
    expect(validateDocId('ABC-XY-ENG-PRO-001').ok).toBe(true)
    expect(validateDocId('BAD').ok).toBe(false)
  })
})

describe('validateDates', () => {
  it('requires ISO and ReviewDate >= IssueDate', () => {
    expect(validateDates('2024-01-01', '2024-01-01').ok).toBe(true)
    expect(validateDates('2024-01-01', '2023-12-31').ok).toBe(false)
    expect(validateDates('01/01/2024', '2024-01-01').ok).toBe(false)
  })
})

describe('validateKeywords', () => {
  it('ensures non-empty strings and limits', () => {
    expect(validateKeywords(['quality','policy']).ok).toBe(true)
    expect(validateKeywords(['']).ok).toBe(false)
    expect(validateKeywords(Array.from({length: 40}).map((_,i)=>`k${i}`)).ok).toBe(false)
  })
})

describe('validateRetention', () => {
  it('checks policy, duration, startDate', () => {
    const good: RetentionSchedule = { policy: 'WORM', durationMonths: 36, startDate: '2024-01-01' }
    expect(validateRetention(good).ok).toBe(true)
    expect(validateRetention({ policy: 'STANDARD', durationMonths: 0 }).ok).toBe(true)
    // @ts-expect-error
    expect(validateRetention({ policy: 'BAD', durationMonths: 12 }).ok).toBe(false)
    expect(validateRetention({ policy: 'WORM', durationMonths: -1 }).ok).toBe(false)
    expect(validateRetention({ policy: 'WORM', durationMonths: 1, startDate: '01/01/2024' }).ok).toBe(false)
  })
})

describe('validateMetadata', () => {
  const base: Metadata = {
    CompanyCode: 'ABC', SubsidiaryCode: 'XY', DepartmentCode: 'ENG', DocumentTypeCode: 'PRO',
    IssueDate: '2024-01-01', ReviewDate: '2024-02-01', Keywords: ['policy'], Description: 'desc',
    RetentionSchedule: { policy: 'STANDARD', durationMonths: 12 }
  }
  it('valid when all required are present and valid', () => {
    expect(validateMetadata(base).ok).toBe(true)
  })
  it('invalid when ReviewDate earlier', () => {
    const bad = { ...base, ReviewDate: '2023-12-31' }
    expect(validateMetadata(bad).ok).toBe(false)
  })
})

describe('checkDuplicateId', () => {
  it('consults async provider', async () => {
    const existsTrue = async () => true
    const existsFalse = async () => false
    await expect(checkDuplicateId('ABC-XY-ENG-PRO-001', existsTrue)).resolves.toMatchObject({ ok: false })
    await expect(checkDuplicateId('ABC-XY-ENG-PRO-001', existsFalse)).resolves.toMatchObject({ ok: true })
  })
})

describe('isAppendOnly (WORM)', () => {
  it('fails on deletions or edits', () => {
    const a: AuditLog[] = [ { id: '1', documentId: 'ABC-XY-ENG-PRO-001' as any, action: 'Created', userId: 'u', timestamp: '2024-01-01T00:00:00Z' } ]
    const b: AuditLog[] = [ ...a, { id: '2', documentId: a[0].documentId, action: 'Accessed', userId: 'u', timestamp: '2024-01-02T00:00:00Z' } ]
    expect(isAppendOnly(a, b)).toBe(true)
    expect(isAppendOnly(b, a)).toBe(false)
    const edited = [ { ...a[0], action: 'Approved' } ]
    expect(isAppendOnly(a, edited)).toBe(false)
  })
})

