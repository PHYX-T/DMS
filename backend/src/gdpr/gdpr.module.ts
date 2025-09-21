import { Module } from '@nestjs/common'
import { GdprController } from './gdpr.controller.js'
import { GdprService } from './gdpr.service.js'
import { UsersService } from '../users/users.service.js'
import { AuditService } from '../audit/audit.service.js'
import { DocumentsService } from '../documents/documents.service.js'

@Module({ controllers: [GdprController], providers: [GdprService, UsersService, AuditService, DocumentsService] })
export class GdprModule {}

