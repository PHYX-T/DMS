import { validate } from 'class-validator'
import { MetadataDto, RetentionScheduleDto } from '../src/documents/dto/create-document.dto.js'

describe('DTO validation', () => {
  it('ReviewDate must be after IssueDate', async () => {
    const meta = new MetadataDto()
    meta.CompanyCode = 'ABC'
    meta.SubsidiaryCode = 'XY'
    meta.DepartmentCode = 'ENG'
    meta.DocumentTypeCode = 'PRO'
    meta.IssueDate = '2025-01-02'
    meta.ReviewDate = '2025-01-01'
    meta.Keywords = ['quality']
    meta.Description = 'desc'
    meta.RetentionSchedule = Object.assign(new RetentionScheduleDto(), { policy: 'STANDARD', durationMonths: 12, startDate: '2025-01-02' })
    const errs = await validate(meta)
    expect(errs.length).toBeGreaterThan(0)
  })
})

