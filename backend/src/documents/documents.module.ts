import { Module } from '@nestjs/common'
import { DocumentsController } from './documents.controller.js'
import { DocumentsService } from './documents.service.js'
import { CodesModule } from '../codes/codes.module.js'
import { WorkflowService } from '../workflow/workflow.service.js'
import { AuditService } from '../audit/audit.service.js'

@Module({ imports: [CodesModule], controllers: [DocumentsController], providers: [DocumentsService, WorkflowService, AuditService] })
export class DocumentsModule {}
