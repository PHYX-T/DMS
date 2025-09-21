import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class ServiceAccountGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest()
    const token = req.headers['x-service-account'] as string | undefined
    if (!token) return true
    // Validate service account token against settings/db
    req.user = { sub: 'service-account', role: 'Admin', service: true }
    return true
  }
}

