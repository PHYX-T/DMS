import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DocumentsService } from './documents.service.js'
import { CreateDocumentDto } from './dto/create-document.dto.js'
import { PaginationDto } from './dto/pagination.dto.js'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { Roles, Role } from '../common/decorators/roles.decorator.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { WorkflowService } from '../workflow/workflow.service.js'

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly docs: DocumentsService, private readonly wf: WorkflowService) {}

  @ApiOperation({ summary: 'Create draft document', description: 'Blocks invalid IDs/metadata; AV scan; writes WORM audit; idempotency via Idempotency-Key header.' })
  @Roles('DocumentController','Admin','QMS')
  @Post()
  @ApiOkResponse({ description: 'Created', schema: { properties: { id: { type: 'string' } } } })
  create(@Body() dto: CreateDocumentDto) { return this.docs.createDraft(dto) }

  @ApiOperation({ summary: 'Get document by ID' })
  @Get(':id')
  @ApiOkResponse({ description: 'Document' })
  byId(@Param('id') id: string) { return this.docs.byId(id) }

  @ApiOperation({ summary: 'Get change history' })
  @Get(':id/history')
  @ApiOkResponse({ description: 'Change history' })
  history(@Param('id') id: string) { return this.docs.history(id) }

  @ApiOperation({ summary: 'Get related documents' })
  @Get(':id/related')
  related(@Param('id') id: string) { return this.docs.related(id) }

  @ApiOperation({ summary: 'Link/unlink related documents' })
  @Post(':id/related')
  linkRelated(@Param('id') id: string, @Body() body: { action: 'link'|'unlink'; relatedId: string }) { return this.docs.linkRelated(id, body) }

  @ApiOperation({ summary: 'List documents (paginated)' })
  @Get()
  list(@Query() q: PaginationDto) { return this.docs.list(q) }

  @ApiOperation({ summary: 'Create new Draft revision (Owner)', description: 'Creates a new Draft version for the document with optional notes.' })
  @Roles('DocumentOwner','Admin','DocumentController')
  @Post(':id/revisions')
  revision(@Param('id') id: string, @Body() body: { notes?: string; minor?: boolean }) { return this.docs.createRevision(id, body) }

  @ApiOperation({ summary: 'Submit document for review/owner-approval' })
  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() body: { minor?: boolean }) { return this.wf.submit(id, !!body?.minor) }

  @ApiOperation({ summary: 'Approve document' })
  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() body: { comment?: string }) { return this.wf.approve(id, body?.comment) }

  @ApiOperation({ summary: 'Reject document' })
  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: { reason?: string }) { return this.wf.reject(id, body?.reason) }

  @ApiOperation({ summary: 'Publish document' })
  @Roles('DocumentController','Admin')
  @Post(':id/publish')
  publish(@Param('id') id: string, @Body() body: { version?: string }) { return this.wf.publish(id, body?.version) }

  @ApiOperation({ summary: 'Archive document' })
  @Roles('DocumentController','Admin')
  @Post(':id/archive')
  archive(@Param('id') id: string, @Body() body: { reason: string }) { return this.wf.archive(id, body?.reason) }

  @ApiOperation({ summary: 'Restore document' })
  @Roles('DocumentController','Admin')
  @Post(':id/restore')
  restore(@Param('id') id: string, @Body() body: { reason: string }) { return this.wf.restore(id, body?.reason) }
}
