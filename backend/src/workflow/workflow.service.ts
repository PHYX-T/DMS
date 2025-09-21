import { BadRequestException, Injectable } from '@nestjs/common'
import { DocumentsService } from '../documents/documents.service.js'
import { AuditService } from '../audit/audit.service.js'
import { FilesService } from '../files/files.service.js'
import { CodesService } from '../codes/codes.service.js'
import { IntegrationsService } from '../integrations/integrations.service.js'

type Status = 'Draft'|'OwnerApproval'|'Review'|'Approved'|'Published'|'Archived'|'Obsolete'

@Injectable()
export class WorkflowService {
  constructor(private readonly docs: DocumentsService, private readonly audit: AuditService, private readonly files: FilesService, private readonly codes: CodesService, private readonly integ: IntegrationsService) {}

  private async getDoc(docId: string) {
    const d = await this.docs.byId(docId)
    if (!d) throw new BadRequestException('not_found')
    return d as any
  }

  async submit(docId: string, minor: boolean) {
    const d = await this.getDoc(docId)
    if (d.status !== 'Draft') throw new BadRequestException('invalid_transition')
    const next: Status = minor ? 'OwnerApproval' : 'Review'
    await this.appendAudit(docId, 'Submitted', { from: d.status, to: next, minor })
    // TODO: persist status and enqueue work item
    return { ok: true, status: next }
  }

  async approve(docId: string, comment?: string) {
    const d = await this.getDoc(docId)
    if (!['OwnerApproval','Review'].includes(d.status)) throw new BadRequestException('invalid_transition')
    const next: Status = 'Approved'
    await this.appendAudit(docId, 'Approved', { from: d.status, to: next, comment })
    return { ok: true, status: next }
  }

  async reject(docId: string, reason?: string) {
    const d = await this.getDoc(docId)
    if (!['OwnerApproval','Review'].includes(d.status)) throw new BadRequestException('invalid_transition')
    const next: Status = 'Draft'
    await this.appendAudit(docId, 'Rejected', { from: d.status, to: next, reason })
    return { ok: true, status: next }
  }

  async publish(docId: string, version?: string) {
    const d = await this.getDoc(docId)
    if (!['Approved','Published'].includes(d.status)) throw new BadRequestException('invalid_transition')
    // Pre-publish checks: files exist & codes active
    await this.prePublishChecks(docId, d)
    const prevVersion = d.version
    const newVersion = version || this.bumpVersion(prevVersion, d.lastMinor ? 'minor' : 'major')
    // Compensating actions pattern
    try {
      // 1) Set latest_approved for new version; archive previous
      // TODO: persist new version row and archive previous latest in a transaction
      // 2) Append audit
      await this.appendAudit(docId, 'Published', { prevVersion, newVersion })
      // 3) Enqueue indexing + notify watchers
      await this.enqueue('indexing', { docId, version: newVersion })
      await this.enqueue('notify', { docId, version: newVersion })
      await this.integ.emit('published', { docId, version: newVersion })
      return { ok: true, version: newVersion }
    } catch (e) {
      // Attempt compensating actions/log
      await this.appendAudit(docId, 'PublishFailed', { error: (e as Error).message })
      throw e
    }
  }

  async archive(docId: string, reason?: string) {
    const d = await this.getDoc(docId)
    await this.appendAudit(docId, 'Archived', { version: d.version, reason })
    await this.integ.emit('archived', { docId, version: d.version, reason })
    return { ok: true }
  }

  async restore(docId: string, reason?: string) {
    const d = await this.getDoc(docId)
    await this.appendAudit(docId, 'Restored', { version: d.version, reason })
    await this.integ.emit('restored', { docId, version: d.version, reason })
    return { ok: true }
  }

  async disposal(docId: string) {
    const d = await this.getDoc(docId)
    const start = new Date(d.issue_date || new Date())
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + (d.retention_years || 0))
    const days = Math.max(0, Math.ceil((end.getTime() - Date.now()) / (24*60*60*1000)))
    return { days, policy: d.retention_policy || 'STANDARD' }
  }

  private bumpVersion(version: string, kind: 'major'|'minor') {
    const [maj, min] = version.split('.').map((x: string) => parseInt(x, 10) || 0)
    return kind === 'major' ? `${maj + 1}.0` : `${maj}.${min + 1}`
  }

  private async appendAudit(documentId: string, action: string, context?: any) {
    await this.audit.append({ action, userId: 'system', documentId, context })
  }
  private async prePublishChecks(docId: string, d: any) {
    // Ensure files present (stubs – replace with DB checks)
    const hasPdf = true // await this.files.hasPdf(docId, d.version)
    const hasSource = true // await this.files.hasSource(docId, d.version)
    if (!hasPdf || !hasSource) throw new BadRequestException({ message: 'prepublish_failed', details: { pdf: hasPdf, source: hasSource } })
    // Validate codes active
    const okCodes = true // await this.codes.validateActiveCodes(d)
    if (!okCodes) throw new BadRequestException({ message: 'invalid_codes' })
  }

  private async enqueue(queue: 'indexing'|'notify', payload: any) {
    // Stub; wire BullMQ/RabbitMQ here
    return true
  }
}
