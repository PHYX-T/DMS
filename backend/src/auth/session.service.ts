import { Injectable } from '@nestjs/common'
import { SignJWT } from 'jose'

type Role = 'EndUser'|'DocumentOwner'|'DocumentController'|'QMS'|'Admin'|'ExternalAuditor'

@Injectable()
export class SessionService {
  private currentKid = 'kid-1'
  private keys: Record<string, CryptoKeyPair> = {}
  private refreshStore = new Map<string, { sub: string; role: Role; exp: number }>()
  private userTokens = new Map<string, Set<string>>()
  private hsSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

  constructor() {}

  async ensureKey(kid = this.currentKid) { return this.keys[kid] }

  async issueTokens(user: { sub: string; email: string; name: string; role: Role }) {
    const now = Math.floor(Date.now() / 1000)
    const accessExp = now + 15 * 60
    const refreshExp = now + 7 * 24 * 60 * 60
    const access = await new SignJWT({ sub: user.sub, email: user.email, name: user.name, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(accessExp)
      .setIssuer('dms')
      .setAudience('dms-api')
      .sign(this.hsSecret)
    const refreshId = crypto.randomUUID()
    this.refreshStore.set(refreshId, { sub: user.sub, role: user.role, exp: refreshExp })
    const set = this.userTokens.get(user.sub) || new Set<string>()
    set.add(refreshId); this.userTokens.set(user.sub, set)
    return { access_token: access, refresh_token: refreshId, token_type: 'Bearer', expires_in: 15 * 60 }
  }

  async rotateKeys() { /* HS256 mode: no-op */ }
  async jwks() { return { keys: [] } }

  async refresh(token: string) {
    const rec = this.refreshStore.get(token)
    if (!rec || rec.exp * 1000 < Date.now()) throw new Error('invalid_refresh')
    // In real impl, verify session not revoked and rotate refresh if desired
    return rec
  }

  revoke(refreshId: string) { this.refreshStore.delete(refreshId) }
  revokeUser(sub: string) { const set = this.userTokens.get(sub); if (!set) return; for (const t of set) this.refreshStore.delete(t); this.userTokens.delete(sub) }
}
