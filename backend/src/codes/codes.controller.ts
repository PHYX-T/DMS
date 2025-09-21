import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { CodesService } from './codes.service.js'

@ApiTags('codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('codes')
export class CodesController {
  constructor(private readonly codes: CodesService) {}

  @ApiOperation({ summary: 'List code list by kind' })
  @Get(':kind')
  @ApiOkResponse({ description: 'Code list' })
  list(@Param('kind') kind: 'companies'|'subsidiaries'|'departments'|'types') { return this.codes.list(kind) }

  @ApiOperation({ summary: 'Propose a code (requires Controller/Admin)', description: 'Creates a work item for QMS approval (dual-approval). Actions: add|edit|remove' })
  @Roles('DocumentController','Admin')
  @Post(':kind/propose')
  propose(@Param('kind') kind: string, @Body() body: { value: string; label?: string; newLabel?: string; action: 'add'|'edit'|'remove' }) { return this.codes.propose(kind, body) }

  @ApiOperation({ summary: 'Approve a code (requires QMS/Admin)' })
  @Roles('QMS','Admin')
  @Post(':kind/:value/approve')
  approve(@Param('kind') kind: string, @Param('value') value: string) { return this.codes.approve(kind, value) }

  @ApiOperation({ summary: 'Reject proposal (requires QMS/Admin)' })
  @Roles('QMS','Admin')
  @Post(':kind/:value/reject')
  reject(@Param('kind') kind: string, @Param('value') value: string) { return this.codes.reject(kind, value) }

  @ApiOperation({ summary: 'Usage counts for a code value', description: 'Returns number of documents using the code for UI display' })
  @Get(':kind/:value/usage')
  usage(@Param('kind') kind: string, @Param('value') value: string) { return this.codes.usage(kind, value) }
}
