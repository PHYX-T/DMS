// Map Microsoft Entra ID (Azure AD) group IDs to application roles
export type Role = 'EndUser'|'DocumentOwner'|'DocumentController'|'QMS'|'Admin'|'ExternalAuditor'
export const GROUP_TO_ROLE: Record<string, Role> = {
  // '00000000-0000-0000-0000-000000000001': 'Admin',
  // '00000000-0000-0000-0000-000000000002': 'DocumentController',
}

export function groupToRole(groups: string[] = []): Role {
  for (const g of groups) {
    const r = GROUP_TO_ROLE[g]
    if (r) return r
  }
  return 'EndUser'
}

