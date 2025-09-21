import { BadRequestException, Injectable } from '@nestjs/common'
import { AuditService } from '../audit/audit.service.js'

type Kind = 'companies'|'subsidiaries'|'departments'|'types'
type Proposal = { kind: Kind; value: string; label?: string; newLabel?: string; action: 'add'|'edit'|'remove'; workItemId: string }

@Injectable()
export class CodesService {
  constructor(private readonly audit: AuditService) {}
  private state: Record<Kind, { value: string; label: string; active: boolean }[]> = {
    companies: [], subsidiaries: [], departments: [], types: [],
  }
  private proposals: Proposal[] = []

  async list(kind: string) {
    const k = kind as Kind
    return { list: (this.state[k] || []).filter(x => x.active !== false) }
  }

  async propose(kind: string, body: { value: string; label?: string; newLabel?: string; action: 'add'|'edit'|'remove' }) {
    const k = kind as Kind
    if (!['add','edit','remove'].includes(body.action)) throw new BadRequestException('invalid_action')
    const workItemId = 'wi_' + Date.now()
    this.proposals.push({ kind: k, value: body.value.toUpperCase(), label: body.label, newLabel: body.newLabel, action: body.action as any, workItemId })
    await this.audit.append({ action: 'CodesProposed', userId: 'controller', context: { kind: k, ...body } })
    // TODO: persist work_item row (type CodesApprove) for QMS with payload
    return { ok: true, work_item_id: workItemId }
  }

  async approve(kind: string, value: string) {
    const k = kind as Kind
    const p = this.proposals.find(x => x.kind === k && x.value === value)
    if (!p) throw new BadRequestException('no_proposal')
    if (p.action === 'add') {
      const exists = (this.state[k] || []).find(c => c.value === value)
      if (exists) exists.active = true
      else (this.state[k] = this.state[k] || []).push({ value, label: p.label || value, active: true })
    } else if (p.action === 'edit') {
      const exists = (this.state[k] || []).find(c => c.value === value)
      if (!exists) throw new BadRequestException('not_found')
      exists.label = p.newLabel || exists.label
    } else if (p.action === 'remove') {
      const exists = (this.state[k] || []).find(c => c.value === value)
      if (exists) exists.active = false
    }
    this.proposals = this.proposals.filter(x => !(x.kind === k && x.value === value))
    await this.audit.append({ action: 'CodesApproved', userId: 'qms', context: { kind: k, value } })
    // TODO: re-index impacted documents by queueing
    return { ok: true }
  }

  async reject(kind: string, value: string) {
    const k = kind as Kind
    this.proposals = this.proposals.filter(x => !(x.kind === k && x.value === value))
    await this.audit.append({ action: 'CodesRejected', userId: 'qms', context: { kind: k, value } })
    return { ok: true }
  }

  async usage(kind: string, value: string) {
    // TODO: query documents table to count usage
    const count = Math.floor(Math.random() * 20)
    return { count }
  }

  async validateActiveCodes(d: any): Promise<boolean> {
    const company = (this.state.companies || []).find(c => c.value === d.Metadata?.CompanyCode)
    const sub = (this.state.subsidiaries || []).find(c => c.value === d.Metadata?.SubsidiaryCode)
    const dept = (this.state.departments || []).find(c => c.value === d.Metadata?.DepartmentCode)
    const type = (this.state.types || []).find(c => c.value === d.Metadata?.DocumentTypeCode)
    return !!(company?.active !== false && sub?.active !== false && dept?.active !== false && type?.active !== false)
  }
}
