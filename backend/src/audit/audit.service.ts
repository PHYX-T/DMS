import { Injectable } from '@nestjs/common'

@Injectable()
export class AuditService {
  async append(entry: { action: string; userId: string; documentId?: string; context?: any }) {
    // Enforce append-only in DB schema; here we just return ok for skeleton
    return { ok: true, id: Date.now().toString() }
  }
  async list() { return [] }
}

