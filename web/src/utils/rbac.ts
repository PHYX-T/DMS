import type { Role } from '@/types/strict'

export function hasRole(userRole: Role, required: Role[] | undefined): boolean {
  if (!required || required.length === 0) return true
  return required.includes(userRole)
}

export function isDelegable(role: Role): role is Extract<Role, 'DocumentOwner' | 'DocumentController'> {
  return role === 'DocumentOwner' || role === 'DocumentController'
}

export function canReadApprovedOnly(role: Role): boolean {
  // ExternalAuditor: only approved docs; others broader permissions decided server-side
  return role === 'ExternalAuditor'
}

export function displayRole(base: Role, effective: Role): string {
  return base === effective ? base : `${effective} (delegated from ${base})`
}

