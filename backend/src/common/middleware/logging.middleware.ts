import { Injectable, NestMiddleware } from '@nestjs/common'

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const start = Date.now()
    const traceId = req.headers['x-trace-id'] || (globalThis as any).crypto?.randomUUID?.() || Math.random().toString(16).slice(2)
    res.setHeader('x-trace-id', traceId)
    res.on('finish', () => {
      const dur = Date.now() - start
      const redactedHeaders = redact(req.headers || {})
      const log = { level: 'info', traceId, method: req.method, path: req.originalUrl || req.url, status: res.statusCode, ms: dur, headers: redactedHeaders }
      console.log(JSON.stringify(log))
    })
    next()
  }
}

function redact(obj: any) {
  const copy: any = {}
  const secrets = ['authorization','x-refresh-token','cookie']
  for (const k of Object.keys(obj)) {
    if (secrets.includes(k.toLowerCase())) copy[k] = '[REDACTED]'
    else copy[k] = obj[k]
  }
  return copy
}

