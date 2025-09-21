import { Injectable } from '@nestjs/common'
import crypto from 'node:crypto'

type OutgoingEvent = 'published'|'archived'|'restored'

@Injectable()
export class IntegrationsService {
  private urls = (process.env.INTEG_WEBHOOK_URLS || '').split(',').map(s => s.trim()).filter(Boolean)
  private secret = process.env.INTEG_WEBHOOK_SECRET || 'dev-secret'

  async emit(event: OutgoingEvent, payload: any) {
    const body = JSON.stringify({ event, ts: Date.now(), payload })
    const ts = String(Math.floor(Date.now() / 1000))
    const sig = this.sign(ts, body)
    for (const url of this.urls) {
      await this.postWithRetry(url, body, { 'Content-Type': 'application/json', 'X-Signature': sig, 'X-Timestamp': ts, 'X-Event': event })
    }
  }

  private sign(ts: string, body: string) {
    const hmac = crypto.createHmac('sha256', this.secret)
    hmac.update(ts + '.' + body)
    return 'sha256=' + hmac.digest('hex')
  }

  private async postWithRetry(url: string, body: string, headers: Record<string,string>) {
    let attempt = 0
    while (attempt < 5) {
      try {
        const res = await fetch(url, { method: 'POST', headers, body })
        if (res.ok) return true
        throw new Error(`status ${res.status}`)
      } catch (e) {
        attempt++
        const backoff = Math.min(32000, 1000 * Math.pow(2, attempt))
        await new Promise(r => setTimeout(r, backoff))
      }
    }
    return false
  }

  // Inbound validation helpers
  validateSignature(ts: string, body: string, signature: string) {
    const expected = this.sign(ts, body)
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ''))
  }
}

