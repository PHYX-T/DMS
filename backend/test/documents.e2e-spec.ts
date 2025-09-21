import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module.js'

describe('Documents endpoints (e2e)', () => {
  let app: INestApplication
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    // Bypass guards for e2e skeleton
    app.useGlobalGuards({ canActivate: () => true } as any)
    await app.init()
  })
  afterAll(async () => { await app.close() })

  it('creates a draft', async () => {
    const dto = {
      ID: 'ABC-XY-ENG-PRO-001',
      Title: 'Quality Policy',
      Metadata: {
        CompanyCode: 'ABC', SubsidiaryCode: 'XY', DepartmentCode: 'ENG', DocumentTypeCode: 'PRO',
        IssueDate: '2025-01-01', ReviewDate: '2025-02-01', Keywords: ['quality'], Description: 'desc',
        RetentionSchedule: { policy: 'STANDARD', durationMonths: 12, startDate: '2025-01-01' }
      }
    }
    const res = await request(app.getHttpServer()).post('/documents').send(dto).expect(201)
    expect(res.body.id).toBe(dto.ID)
  })

  it('submits and publishes', async () => {
    await request(app.getHttpServer()).post('/documents/ABC-XY-ENG-PRO-001/submit').send({ minor: false }).expect(201)
    await request(app.getHttpServer()).post('/documents/ABC-XY-ENG-PRO-001/approve').send({}).expect(201)
    await request(app.getHttpServer()).post('/documents/ABC-XY-ENG-PRO-001/publish').send({}).expect(201)
  })
})

