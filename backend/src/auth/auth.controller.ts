import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service.js'
import { JwtAuthGuard } from './jwt.guard.js'
import { JwksService } from './jwks.service.js'
import { SessionService } from './session.service.js'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly jwks: JwksService, private readonly sessions: SessionService) {}

  @ApiOperation({ summary: 'Get current session' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({ schema: { properties: { user: { type: 'object' } } } })
  me(@Req() req: any) { return { user: req.user } }

  @ApiOperation({ summary: 'OIDC login (Microsoft Entra ID)', description: 'Redirects to OIDC provider for auth code + PKCE.' })
  @Get('login')
  login(@Res() res: any) { return this.auth.oidcLogin(res) }

  @ApiOperation({ summary: 'OIDC callback', description: 'Exchanges code for tokens, maps groups→role, issues JWT access/refresh.' })
  @Get('callback')
  async callback(@Req() req: any, @Res() res: any) { return this.auth.oidcCallback(req, res) }

  @ApiOperation({ summary: 'Refresh access token' })
  @Post('refresh')
  @ApiOkResponse({ schema: { properties: { access_token: { type: 'string' } } } })
  async refresh(@Req() req: any) { return this.auth.refresh(req) }

  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @Post('logout')
  async logout(@Req() req: any) { return this.auth.logout(req) }

  @ApiOperation({ summary: 'JWKS (public keys)' })
  @Get('.well-known/jwks.json')
  jwksJson() { return this.jwks.jwks() }

  // Dev-only login helper (non-production)
  @ApiOperation({ summary: '[DEV] Issue tokens', description: 'Development helper to issue HS256 tokens locally. Disabled in production.' })
  @Post('dev-login')
  async devLogin(@Req() req: any) {
    if (process.env.NODE_ENV === 'production') return { error: 'not_available' }
    const { sub = 'u-admin', email = 'admin@example.com', name = 'Admin', role = 'Admin' } = req.body || {}
    return this.sessions.issueTokens({ sub, email, name, role })
  }
}
