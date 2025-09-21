import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service.js'
import { AuthController } from './auth.controller.js'
import { JwtStrategy } from './jwt.strategy.js'
import { OidcStrategy } from './oidc.strategy.js'
import { SessionService } from './session.service.js'
import { JwksService } from './jwks.service.js'
import { ServiceAccountGuard } from './service-account.guard.js'

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OidcStrategy, SessionService, JwksService, ServiceAccountGuard],
  exports: [AuthService, SessionService, JwksService, ServiceAccountGuard],
})
export class AuthModule {}
