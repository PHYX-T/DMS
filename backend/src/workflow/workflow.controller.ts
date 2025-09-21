import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { AbacGuard } from '../common/guards/abac.guard.js'
import { WorkflowService } from './workflow.service.js'
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor.js'

@ApiTags('workflow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AbacGuard)
@UseInterceptors(IdempotencyInterceptor)
@Controller('workflow')
export class WorkflowController {
  constructor(private readonly wf: WorkflowService) {}

  @ApiOperation({ summary: 'Submit draft for review/owner-approval', description: 'Minor=true routes to OwnerApproval; otherwise Review. Writes audit.' })
  @Roles('DocumentOwner','DocumentController','Admin')
  @Post(':docId/submit')
  submit(@Param('docId') docId: string, @Query('minor') minor?: string) { return this.wf.submit(docId, minor === 'true') }

  @ApiOperation({ summary: 'Approve document', description: 'Transition from OwnerApproval/Review → Approved. Writes audit.' })
  @Roles('DocumentOwner','QMS','Admin','DocumentController')
  @Post(':docId/approve')
  approve(@Param('docId') docId: string, @Body() body: { comment?: string }) { return this.wf.approve(docId, body?.comment) }

  @ApiOperation({ summary: 'Reject document', description: 'Transition from OwnerApproval/Review → Draft. Writes audit.' })
  @Roles('DocumentOwner','QMS','Admin','DocumentController')
  @Post(':docId/reject')
  reject(@Param('docId') docId: string, @Body() body: { reason?: string }) { return this.wf.reject(docId, body?.reason) }

  @ApiOperation({ summary: 'Publish document', description: 'Approved → Published; sets latest_approved; archives previous; enqueues indexing+notify. Writes audit.' })
  @Roles('DocumentController','Admin')
  @Post(':docId/publish')
  publish(@Param('docId') docId: string, @Body() body: { version?: string }) { return this.wf.publish(docId, body?.version) }

  @ApiOperation({ summary: 'Archive document', description: 'Archives a document version with reason. Writes audit.' })
  @Roles('DocumentController','Admin')
  @Post(':docId/archive')
  archive(@Param('docId') docId: string, @Body() body: { reason: string }) { return this.wf.archive(docId, body?.reason) }

  @ApiOperation({ summary: 'Restore document', description: 'Restore requires Controller/Admin with reason. Writes audit.' })
  @Roles('DocumentController','Admin')
  @Post(':docId/restore')
  restore(@Param('docId') docId: string, @Body() body: { reason: string }) { return this.wf.restore(docId, body?.reason) }

  @ApiOperation({ summary: 'Disposal countdown', description: 'Returns days until disposal based on retention; deletion is admin tool only.' })
  @Get(':docId/disposal')
  @ApiOkResponse({ schema: { properties: { days: { type: 'number' }, policy: { type: 'string' } } } })
  disposal(@Param('docId') docId: string) { return this.wf.disposal(docId) }
}

