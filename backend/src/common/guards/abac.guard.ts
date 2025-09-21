import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { POLICIES_KEY, PolicyHandler } from '../decorators/policies.decorator.js'

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const handlers = this.reflector.getAllAndOverride<PolicyHandler[]>(POLICIES_KEY, [ctx.getHandler(), ctx.getClass()])
    if (!handlers || handlers.length === 0) return true
    const req = ctx.switchToHttp().getRequest()
    const user = req.user
    const resource = req.resource
    // ExternalAuditor: enforce read-only
    if (user?.role === 'ExternalAuditor' && req.method !== 'GET') return false
    for (const h of handlers) {
      const ok = await Promise.resolve(h(user, resource))
      if (!ok) return false
    }
    return true
  }
}
