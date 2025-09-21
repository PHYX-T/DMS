import { Module } from '@nestjs/common'
import { IntegrationsService } from './integrations.service.js'
import { IntegrationsController } from './integrations.controller.js'
import { AuditService } from '../audit/audit.service.js'

@Module({ providers: [IntegrationsService, AuditService], controllers: [IntegrationsController], exports: [IntegrationsService] })
export class IntegrationsModule {}

