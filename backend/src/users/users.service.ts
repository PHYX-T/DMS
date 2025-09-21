import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersService {
  async list() { return [] }
  async setRole(id: string, role: string) { return { id, role } }
}

