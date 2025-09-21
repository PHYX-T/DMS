import { Module } from '@nestjs/common'
import { BackupService } from './backup.service.js'
import { AuditService } from '../audit/audit.service.js'

@Module({ providers: [BackupService, AuditService], exports: [BackupService] })
export class BackupModule {}

