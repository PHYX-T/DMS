import { describe, it, expect } from 'vitest'
import { hasRole, isDelegable, canReadApprovedOnly, displayRole } from '@/utils/rbac'

describe('rbac utils', () => {
  it('hasRole matches required roles', () => {
    expect(hasRole('Admin' as any, ['Admin'] as any)).toBe(true)
    expect(hasRole('QMS' as any, ['Admin'] as any)).toBe(false)
    expect(hasRole('EndUser' as any, undefined as any)).toBe(true)
  })
  it('delegable roles are Owner/Controller', () => {
    expect(isDelegable('DocumentOwner' as any)).toBe(true)
    expect(isDelegable('DocumentController' as any)).toBe(true)
    expect(isDelegable('Admin' as any)).toBe(false)
  })
  it('external auditor approved-only', () => {
    expect(canReadApprovedOnly('ExternalAuditor' as any)).toBe(true)
    expect(canReadApprovedOnly('Admin' as any)).toBe(false)
  })
  it('displayRole shows delegation label', () => {
    expect(displayRole('Admin' as any, 'Admin' as any)).toBe('Admin')
    expect(displayRole('Admin' as any, 'DocumentOwner' as any)).toContain('delegated')
  })
})

