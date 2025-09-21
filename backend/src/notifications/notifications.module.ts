import { Module } from '@nestjs/common'
import { NotificationsController } from './notifications.controller.js'
import { NotificationsService } from './notifications.service.js'
import { EmailService } from './email/email.service.js'
import { AuditService } from '../audit/audit.service.js'

@Module({ controllers: [NotificationsController], providers: [NotificationsService, EmailService, AuditService], exports: [NotificationsService] })
export class NotificationsModule {}

