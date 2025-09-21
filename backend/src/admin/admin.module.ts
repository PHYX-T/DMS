import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller.js'
import { UsersService } from '../users/users.service.js'
import { AuditService } from '../audit/audit.service.js'
import { SessionService } from '../auth/session.service.js'

@Module({ controllers: [AdminController], providers: [UsersService, AuditService, SessionService] })
export class AdminModule {}

