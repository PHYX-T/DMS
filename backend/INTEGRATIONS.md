# Integrations: Webhooks (Outgoing) and Inbound Hooks

## Outgoing Webhooks

Events
- `published`: `{ event, ts, payload: { docId, version } }`
- `archived`: `{ event, ts, payload: { docId, version, reason } }`
- `restored`: `{ event, ts, payload: { docId, version, reason } }`

Delivery
- Configured via `INTEG_WEBHOOK_URLS` (comma‑separated)
- Retries with exponential backoff up to 5 attempts
- Headers:
  - `X-Event`: event name
  - `X-Timestamp`: UNIX seconds (string)
  - `X-Signature`: `sha256=...` HMAC over `X-Timestamp + '.' + body` using `INTEG_WEBHOOK_SECRET`

Verify HMAC (pseudo)
```js
const expected = 'sha256=' + hmac_sha256(secret, ts + '.' + body)
if (!timingSafeEqual(expected, signature)) reject
// Also ensure |now - Number(ts)| <= 300 seconds
```

## Inbound Webhook: External Reference Update

Endpoint: `POST /api/v1/integrations/webhook/external-reference`
- Headers:
  - `X-Timestamp`: UNIX seconds
  - `X-Signature`: `sha256=...` HMAC over `ts + '.' + rawBody`
  - `X-Event-Id`: unique id for replay prevention (cached for 10 minutes)
- Body JSON: `{ docId, externalRefType, externalId, ... }`

Server verification
- Check timestamp within 5 minutes, verify signature, reject on replayed `X-Event-Id`

## Notes
- Use HTTPS only; rotate `INTEG_WEBHOOK_SECRET` regularly
- Consider per‑endpoint secrets if multiple partners
- For ERP/DMS legacy bridges, include correlation ids and retry policies on their side

