import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../src/app.module.js'

describe('Reports (e2e)', () => {
  let app: INestApplication
  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = mod.createNestApplication()
    // bypass guards for test
    app.useGlobalGuards({ canActivate: () => true } as any)
    await app.init()
  })
  afterAll(async () => { await app.close() })

  it('/reports/kpis returns KPIs', async () => {
    const res = await request(app.getHttpServer()).get('/reports/kpis?from=2025-01-01&to=2025-12-31')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('latestApprovedPct')
  })

  it('/reports/trends returns series', async () => {
    const res = await request(app.getHttpServer()).get('/reports/trends?metric=cycle_time')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.series)).toBe(true)
  })
})

