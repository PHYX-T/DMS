import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateDocumentDto } from './dto/create-document.dto.js'
import { PaginationDto } from './dto/pagination.dto.js'
import { CodesService } from '../codes/codes.service.js'

@Injectable()
export class DocumentsService {
  constructor(private readonly codes: CodesService) {}
  async createDraft(dto: CreateDocumentDto) {
    const okCodes = await this.codes.validateActiveCodes(dto)
    if (!okCodes) throw new BadRequestException({ code: 'invalid_codes', message: 'One or more codes are inactive', details: { CompanyCode: dto.Metadata.CompanyCode, SubsidiaryCode: dto.Metadata.SubsidiaryCode, DepartmentCode: dto.Metadata.DepartmentCode, DocumentTypeCode: dto.Metadata.DocumentTypeCode } })
    // TODO: enforce duplicate check; AV scan source; write WORM audit
    return { id: dto.ID }
  }
  async byId(id: string) { return { ID: id } }
  async history(id: string) { return { items: [] } }
  async related(id: string) { return { items: [] } }
  async linkRelated(id: string, body: { action: 'link'|'unlink'; relatedId: string }) { return { ok: true } }
  async list(q: PaginationDto) { return { items: [], total: 0, page: q.page, pageSize: q.pageSize } }
  async createRevision(id: string, body: { notes?: string; minor?: boolean }) { return { id, status: 'Draft', version: body?.minor ? '1.1' : '2.0' } }
}
