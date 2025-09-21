import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { IntegrationsService } from './integrations.service.js'

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integ: IntegrationsService) {}
  private replayCache = new Map<string, number>()

  @ApiOperation({ summary: 'Inbound webhook: external reference update', description: 'Verifies HMAC signature and prevents replay via event id + timestamp' })
  @Post('webhook/external-reference')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Accepted' })
  async externalRef(@Headers('x-signature') signature: string, @Headers('x-timestamp') ts: string, @Headers('x-event-id') eventId: string, @Body() body: any) {
    const raw = JSON.stringify(body)
    if (!ts || !signature || !eventId) return { ok: false }
    const nowSec = Math.floor(Date.now() / 1000)
    if (Math.abs(nowSec - Number(ts)) > 300) return { ok: false, error: 'stale' }
    if (!this.integ.validateSignature(ts, raw, signature)) return { ok: false, error: 'bad_sig' }
    // Replay prevention: cache event id for 10 minutes
    const existing = this.replayCache.get(eventId)
    if (existing && (Date.now() - existing < 10 * 60 * 1000)) return { ok: true, replay: true }
    this.replayCache.set(eventId, Date.now())
    // TODO: process external reference binding, e.g., link PO → document
    return { ok: true }
  }
}

