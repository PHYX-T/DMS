import { Injectable } from '@nestjs/common'
import { SessionService } from './session.service.js'
import { groupToRole } from './roles.map.js'

@Injectable()
export class AuthService {
  constructor(private readonly sessions: SessionService) {}
  oidcLogin(res: any) {
    // Build OIDC authorization URL with code+PKCE (openid-client) and redirect
    const redirect = '/auth/callback' // placeholder
    return res.redirect(302, redirect)
  }
  async oidcCallback(req: any, res: any) {
    // Exchange code, fetch userinfo + groups
    const email = 'user@example.com'
    const name = 'User'
    const groups: string[] = []
    const role = groupToRole(groups)
    // Upsert user in DB here
    const tokens = await this.sessions.issueTokens({ sub: email, email, name, role })
    return res.json(tokens)
  }
  async refresh(req: any) {
    const refresh = req.body?.refresh_token || req.headers['x-refresh-token']
    const rec = await this.sessions.refresh(refresh)
    const tokens = await this.sessions.issueTokens({ sub: rec.sub, email: rec.sub, name: rec.sub, role: rec.role as any })
    return { access_token: tokens.access_token, token_type: 'Bearer', expires_in: 15 * 60 }
  }
  async logout(req: any) {
    const refresh = req.body?.refresh_token || req.headers['x-refresh-token']
    if (refresh) this.sessions.revoke(refresh)
    return { ok: true }
  }
}
