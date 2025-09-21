import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { MetricsService } from '../../metrics/metrics.service.js'
let otel: any
try { otel = await import('@opentelemetry/api') } catch { otel = null }

function genTraceId() { return (globalThis as any).crypto?.randomUUID?.() || Math.random().toString(16).slice(2) }

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const res = context.switchToHttp().getResponse()
    const start = process.hrtime.bigint()
    const route = req.route?.path || req.originalUrl || req.url
    const method = req.method
    const traceId = req.headers['x-trace-id'] || genTraceId()
    res.setHeader('x-trace-id', traceId)
    let span: any
    if (otel?.trace) {
      const tracer = otel.trace.getTracer('dms')
      span = tracer.startSpan('http_request', { attributes: { route, method, traceId } })
    }
    return next.handle().pipe(tap(() => {
      const durationNs = Number(process.hrtime.bigint() - start)
      const durationSec = durationNs / 1e9
      const status = res.statusCode || 200
      this.metrics.httpDuration?.labels(method, route, String(status)).observe(durationSec)
      if (span) span.end()
    }))
  }
}

