import { Injectable } from '@nestjs/common'
let prom: any
try { prom = await import('prom-client') } catch { prom = null }

@Injectable()
export class MetricsService {
  public readonly register = prom ? prom.register : null
  public readonly httpDuration = prom ? new prom.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.05,0.1,0.2,0.5,1,2,5]
  }) : null
  public readonly jobSuccess = prom ? new prom.Counter({ name: 'jobs_success_total', help: 'Successful jobs', labelNames: ['queue'] }) : null
  public readonly jobFailure = prom ? new prom.Counter({ name: 'jobs_failure_total', help: 'Failed jobs', labelNames: ['queue'] }) : null
  public readonly queueDepth = prom ? new prom.Gauge({ name: 'queue_depth', help: 'Queue depth', labelNames: ['queue'] }) : null
  public readonly avScan = prom ? new prom.Histogram({ name: 'av_scan_seconds', help: 'AV scan duration', buckets: [0.1,0.5,1,2,5] }) : null

  async metricsText() { return this.register ? await this.register.metrics() : '' }
}

