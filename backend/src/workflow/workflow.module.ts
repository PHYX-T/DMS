import { Module } from '@nestjs/common'
import { WorkflowController } from './workflow.controller.js'
import { WorkflowService } from './workflow.service.js'
import { DocumentsService } from '../documents/documents.service.js'
import { AuditService } from '../audit/audit.service.js'
import { IntegrationsService } from '../integrations/integrations.service.js'

@Module({ controllers: [WorkflowController], providers: [WorkflowService, DocumentsService, AuditService, IntegrationsService] })
export class WorkflowModule {}
