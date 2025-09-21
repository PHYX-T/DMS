import { Injectable } from '@nestjs/common'

@Injectable()
export class SystemService {
  async ready() { return { db: 'ok', cache: 'ok', search: 'ok' } }
}

