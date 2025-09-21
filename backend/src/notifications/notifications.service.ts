import { Injectable } from '@nestjs/common'
import { EmailService } from './email/email.service.js'
import { renderTemplate } from './templates.js'
import { AuditService } from '../audit/audit.service.js'

type Trigger = 'review_assigned'|'approval_pending'|'publish_success'|'publish_failure'|'upcoming_expiry'|'delegation_start'|'delegation_end'
type Digest = 'off'|'daily'|'weekly'

@Injectable()
export class NotificationsService {
  constructor(private readonly email: EmailService, private readonly audit: AuditService) {}
  private items: { id: string; userId: string; type: Trigger; payload: any; readAt?: number; createdAt: number }[] = []
  private prefs = new Map<string, { digest: Digest; time: string }>()
  private queue: { attempt: number; id: string; userId: string; type: Trigger; payload: any }[] = []
  private deadLetter: any[] = []

  async list(userId: string) { return this.items.filter(i => i.userId === userId).map(i => ({ id: i.id, type: i.type, payload: i.payload, readAt: i.readAt, createdAt: i.createdAt })) }
  async markRead(userId: string, ids: string[]) { this.items.filter(i => i.userId === userId && ids.includes(i.id)).forEach(i => i.readAt = Date.now()); return { ok: true } }
  async getPrefs(userId: string) { return this.prefs.get(userId) || { digest: 'off', time: '09:00' } }
  async setPrefs(userId: string, p: { digest: Digest; time?: string }) { this.prefs.set(userId, { digest: p.digest, time: p.time || '09:00' }); return { ok: true } }

  async trigger(type: Trigger, userId: string, payload: any) {
    const id = 'n_' + Date.now() + Math.random().toString(16).slice(2)
    this.items.unshift({ id, userId, type, payload, createdAt: Date.now() })
    // Enqueue email job unless digest is on
    const pref = await this.getPrefs(userId)
    if (pref.digest === 'off') this.enqueue({ id, userId, type, payload, attempt: 0 })
    await this.audit.append({ action: 'NotificationQueued', userId, context: { type } })
    return { ok: true, id }
  }

  enqueue(job: { id: string; userId: string; type: Trigger; payload: any; attempt: number }) { this.queue.push(job); setTimeout(() => this.process(), 10) }

  private async process() {
    const job = this.queue.shift()
    if (!job) return
    const { subject, text } = renderTemplate(job.type, job.payload)
    try {
      await this.email.send(job.userId, subject, text)
      await this.audit.append({ action: 'NotificationSent', userId: job.userId, context: { type: job.type } })
    } catch (e) {
      job.attempt++
      if (job.attempt <= 5) {
        const backoff = Math.min(32000, 1000 * Math.pow(2, job.attempt))
        setTimeout(() => this.enqueue(job), backoff)
      } else {
        this.deadLetter.push({ ...job, error: (e as Error).message })
        await this.audit.append({ action: 'NotificationDeadLetter', userId: job.userId, context: { type: job.type } })
      }
    }
  }
}

