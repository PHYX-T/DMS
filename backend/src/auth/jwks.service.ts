import { Injectable } from '@nestjs/common'
import { SessionService } from './session.service.js'

@Injectable()
export class JwksService {
  constructor(private readonly sessions: SessionService) {}
  async jwks() { return this.sessions.jwks() }
}

