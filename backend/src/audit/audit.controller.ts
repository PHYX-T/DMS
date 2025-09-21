import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuditService } from './audit.service.js'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { RolesGuard } from '../common/guards/roles.guard.js'

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @ApiOperation({ summary: 'Append audit entry (append-only, WORM)' })
  @Post()
  append(@Body() body: { action: string; userId: string; documentId?: string; context?: any }) { return this.audit.append(body) }

  @ApiOperation({ summary: 'List audit entries (paginated search)', description: 'Immutable by design – no updates or deletes.' })
  @Roles('Admin','QMS')
  @Get()
  @ApiOkResponse({ description: 'Audit entries' })
  list() { return this.audit.list() }
}

