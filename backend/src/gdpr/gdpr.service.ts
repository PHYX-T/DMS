import { Injectable, OnModuleInit } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import { AuditService } from '../audit/audit.service.js'
import { DocumentsService } from '../documents/documents.service.js'

@Injectable()
export class GdprService implements OnModuleInit {
  constructor(private readonly users: UsersService, private readonly audit: AuditService, private readonly docs: DocumentsService) {}
  private erasureRequests: { userId: string; at: number; reason?: string }[] = []

  async dsar(userId: string) {
    const profile = (await this.users.list()).find((u: any) => u.id === userId) || { id: userId, name: 'Unknown', email: userId }
    const auditEntries = await this.audit.list()
    const mine = (auditEntries as any[]).filter(e => e.userId === userId || e.actor_id === userId)
    return { profile, audit: mine }
  }

  async rectify(userId: string, body: { name?: string }) {
    // Rectification: update profile fields (not audit)
    // In real impl, update users table
    return { ok: true, updated: body }
  }

  async erasureRequest(userId: string, reason?: string) {
    this.erasureRequests.push({ userId, at: Date.now(), reason })
    const explanation = 'Documents are organizational records and cannot be erased. Your request has been recorded and we will respond per GDPR timelines.'
    await this.audit.append({ action: 'ErasureRequested', userId, context: { reason } })
    return { ok: true, message: explanation }
  }

  async eligibleForDisposal() {
    // Should query DB for documents whose (issue_date + retention_years) < now()
    return { items: [] }
  }

  async runRetentionCheck() {
    // Mark documents EligibleForDisposal (field or status) and log
    await this.audit.append({ action: 'RetentionCheckRun', userId: 'system', context: {} })
    return { ok: true }
  }

  onModuleInit() {
    // Daily timer (at startup; replace with @nestjs/schedule cron in production)
    const dayMs = 24 * 60 * 60 * 1000
    setInterval(() => { void this.runRetentionCheck() }, dayMs)
  }
}

