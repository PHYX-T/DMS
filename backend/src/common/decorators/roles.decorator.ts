import { SetMetadata } from '@nestjs/common'
export const ROLES_KEY = 'roles'
export type Role = 'EndUser'|'DocumentOwner'|'DocumentController'|'QMS'|'Admin'|'ExternalAuditor'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

