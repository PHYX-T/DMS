import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private cache = new Map<string, { at: number; data: any }>()
  private ttl = 24 * 60 * 60 * 1000
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const userId = req.user?.sub || 'anon'
    const key = req.headers['idempotency-key'] as string | undefined
    if (!key) return next.handle()
    const cacheKey = `${userId}:${key}:${req.method}:${req.originalUrl}`
    const existing = this.cache.get(cacheKey)
    if (existing && Date.now() - existing.at < this.ttl) {
      return of(existing.data)
    }
    return next.handle().pipe(tap((res) => {
      this.cache.set(cacheKey, { at: Date.now(), data: res })
      // prune occasionally
      if (this.cache.size > 1000) {
        const now = Date.now()
        for (const [k,v] of this.cache.entries()) if (now - v.at > this.ttl) this.cache.delete(k)
      }
    }))
  }
}
