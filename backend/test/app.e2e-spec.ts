import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module.js'

describe('App (e2e)', () => {
  let app: INestApplication
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()
  })
  afterAll(async () => { await app.close() })

  it('/health works', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200)
    expect(res.body.ok).toBeTruthy()
  })
})

