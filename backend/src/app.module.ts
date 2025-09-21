import { Module } from '@nestjs/common'
import { ConfigModule } from './config/config.module.js'
import { AuthModule } from './auth/auth.module.js'
import { UsersModule } from './users/users.module.js'
import { DocumentsModule } from './documents/documents.module.js'
import { CodesModule } from './codes/codes.module.js'
import { AuditModule } from './audit/audit.module.js'
import { SearchModule } from './search/search.module.js'
import { FilesModule } from './files/files.module.js'
import { SystemModule } from './system/system.module.js'
import { WorkflowModule } from './workflow/workflow.module.js'
import { ReportsModule } from './reports/reports.module.js'
import { NotificationsModule } from './notifications/notifications.module.js'
import { AdminModule } from './admin/admin.module.js'
import { GdprModule } from './gdpr/gdpr.module.js'
import { BackupModule } from './backup/backup.module.js'
import { MetricsModule } from './metrics/metrics.module.js'
import { IntegrationsModule } from './integrations/integrations.module.js'
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot([{ ttl: 60, limit: 120 }]),
    AuthModule,
    UsersModule,
    DocumentsModule,
    CodesModule,
    AuditModule,
    SearchModule,
    FilesModule,
    SystemModule,
    WorkflowModule,
    ReportsModule,
    NotificationsModule,
    AdminModule,
    GdprModule,
    BackupModule,
    MetricsModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
