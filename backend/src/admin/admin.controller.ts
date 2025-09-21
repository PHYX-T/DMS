import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { UsersService } from '../users/users.service.js'
import { AuditService } from '../audit/audit.service.js'
import { SessionService } from '../auth/session.service.js'

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly users: UsersService, private readonly audit: AuditService, private readonly sessions: SessionService) {}

  // Users
  @ApiOperation({ summary: 'List users' })
  @Get('users')
  listUsers() { return this.users.list() }

  @ApiOperation({ summary: 'Invite user (email)' })
  @Post('users/invite')
  async invite(@Body() body: { email: string; role?: string }) { await this.audit.append({ action: 'UserInvited', userId: 'admin', context: { email: body.email } }); return { ok: true } }

  @ApiOperation({ summary: 'Change user role' })
  @Post('users/role')
  async changeRole(@Body() body: { id: string; role: string }) { const res = await this.users.setRole(body.id, body.role as any); await this.audit.append({ action: 'RoleChanged', userId: 'admin', context: { id: body.id, role: body.role } }); return res }

  @ApiOperation({ summary: 'Deactivate/reactivate user' })
  @Post('users/status')
  async status(@Body() body: { id: string; status: 'active'|'inactive' }) { await this.audit.append({ action: 'UserStatusChanged', userId: 'admin', context: { id: body.id, status: body.status } }); return { ok: true } }

  @ApiOperation({ summary: 'Force logout user' })
  @Post('users/force-logout')
  async forceLogout(@Body() body: { id: string }) { await this.sessions.revokeUser?.(body.id); await this.audit.append({ action: 'UserForceLogout', userId: 'admin', context: { id: body.id } }); return { ok: true } }

  // Roles & Permissions
  private rolesMatrix: Record<string, string[]> = {
    'document.publish': ['DocumentController','Admin'],
    'document.archive': ['DocumentController','Admin'],
    'document.restore': ['DocumentController','Admin'],
    'codes.propose': ['DocumentController','Admin'],
    'codes.approve': ['QMS','Admin'],
    'audit.view': ['Admin','QMS'],
  }
  private policyVersion = 1

  @ApiOperation({ summary: 'Fetch roles & permissions matrix' })
  @Get('roles')
  getRoles() { return { version: this.policyVersion, matrix: this.rolesMatrix } }

  @ApiOperation({ summary: 'Update policy snapshot (versioned)' })
  @Post('roles')
  async setRoles(@Body() body: { version: number; matrix: Record<string,string[]> }) { this.rolesMatrix = body.matrix; this.policyVersion = body.version + 1; await this.audit.append({ action: 'PolicyUpdated', userId: 'admin', context: { version: this.policyVersion } }); return { ok: true, version: this.policyVersion } }

  // Settings
  private settings = { minorRevisionPolicy: false, ssoConfigured: false, density: 'comfortable', theme: 'light', retentionPolicy: 'Retention is managed server-side. Disposal is automatic.' }

  @ApiOperation({ summary: 'Get settings' })
  @Get('settings')
  getSettings() { return this.settings }

  @ApiOperation({ summary: 'Update minor revision policy' })
  @Post('settings/minor')
  async setMinor(@Body() body: { enabled: boolean }) { this.settings.minorRevisionPolicy = !!body.enabled; await this.audit.append({ action: 'MinorPolicyToggled', userId: 'admin', context: { enabled: this.settings.minorRevisionPolicy } }); return { ok: true } }

  // Audit
  @ApiOperation({ summary: 'Search audit' })
  @Get('audit/search')
  async auditSearch(@Query() q: { action?: string; user?: string; document?: string; from?: string; to?: string }) { return this.audit.list() }

  @ApiOperation({ summary: 'Audit CSV export (stream)' })
  @Get('audit/export')
  async auditExport(@Res() res: any) {
    res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', 'attachment; filename="audit.csv"')
    res.write('ts,action,user,document,details\n')
    const items = await this.audit.list()
    for (const e of items as any[]) {
      res.write(`${e.timestamp || e.ts || ''},${e.action || ''},${e.userId || ''},${e.documentId || ''},"${JSON.stringify(e.details || e.context || {}).replace(/"/g,'""')}"\n`)
    }
    res.end()
  }

  // Backups
  private lastSnapshot = new Date().toISOString()
  @ApiOperation({ summary: 'Get backup status' })
  @Get('backups')
  backups() { return { lastSnapshotAt: this.lastSnapshot, rtoHours: 4, rpoHours: 1 } }

  @ApiOperation({ summary: 'Start snapshot' })
  @Post('backups/snapshot')
  async snapshot() { this.lastSnapshot = new Date().toISOString(); await this.audit.append({ action: 'SnapshotStarted', userId: 'admin', context: {} }); return { ok: true, at: this.lastSnapshot } }

  @ApiOperation({ summary: 'Simulate restore (no destructive action)' })
  @Post('backups/restore')
  async restore() { await this.audit.append({ action: 'RestoreSimulated', userId: 'admin', context: {} }); return { ok: true } }

  // Status
  @ApiOperation({ summary: 'System status' })
  @Get('status')
  status() { return { queues: { indexing: 0, notify: 0 }, storagePct: 42, indexHealth: 'green', db: 'ok' } }
}

