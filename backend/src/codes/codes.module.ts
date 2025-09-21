import { Module } from '@nestjs/common'
import { CodesController } from './codes.controller.js'
import { CodesService } from './codes.service.js'
import { AuditService } from '../audit/audit.service.js'

@Module({ controllers: [CodesController], providers: [CodesService, AuditService], exports: [CodesService] })
export class CodesModule {}
