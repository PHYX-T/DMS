import { AbacGuard } from '../src/common/guards/abac.guard.js'
import { Reflector } from '@nestjs/core'

function mockCtx(userRole: string, method: string) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user: { role: userRole }, method }), getResponse: () => ({}) }),
    getClass: () => ({}),
    getHandler: () => ({}),
  } as any
}

describe('AbacGuard', () => {
  it('denies non-GET for ExternalAuditor', async () => {
    const guard = new AbacGuard(new Reflector())
    const ok = await guard.canActivate(mockCtx('ExternalAuditor', 'POST'))
    expect(ok).toBe(false)
  })
  it('allows GET for ExternalAuditor with no policies', async () => {
    const guard = new AbacGuard(new Reflector())
    const ok = await guard.canActivate(mockCtx('ExternalAuditor', 'GET'))
    expect(ok).toBe(true)
  })
})

