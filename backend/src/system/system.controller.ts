import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SystemService } from './system.service.js'
import { BackupService } from '../backup/backup.service.js'

@ApiTags('system')
@Controller()
export class SystemController {
  constructor(private readonly system: SystemService, private readonly backups: BackupService) {}
  @ApiOperation({ summary: 'Liveness probe' })
  @Get('health')
  @ApiOkResponse({ description: 'OK' })
  health() { return { ok: true } }
  @ApiOperation({ summary: 'Readiness probe' })
  @Get('ready')
  ready() { return this.system.ready() }
  @ApiOperation({ summary: 'System status (snapshots & health)' })
  @Get('status')
  status() { return { lastSnapshots: this.backups.getLast(), db: 'ok', index: 'green' } }
}
