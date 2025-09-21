import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../src/app.module.js'

describe('Notifications (e2e)', () => {
  let app: INestApplication
  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = mod.createNestApplication()
    app.useGlobalGuards({ canActivate: () => true } as any)
    await app.init()
  })
  afterAll(async () => { await app.close() })

  it('can set prefs and send a test notification', async () => {
    await request(app.getHttpServer()).post('/notifications/prefs').send({ digest: 'off' }).expect(201)
    const res = await request(app.getHttpServer()).post('/notifications/test').send({}).expect(201)
    expect(res.body.ok).toBe(true)
    const list = await request(app.getHttpServer()).get('/notifications').expect(200)
    expect(Array.isArray(list.body)).toBe(true)
  })
})

