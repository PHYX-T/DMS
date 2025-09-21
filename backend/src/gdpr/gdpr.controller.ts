import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { GdprService } from './gdpr.service.js'

@ApiTags('gdpr')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gdpr')
export class GdprController {
  constructor(private readonly gdpr: GdprService) {}

  @ApiOperation({ summary: 'Data Subject Access Request (DSAR)' })
  @Get('dsar')
  @ApiOkResponse({ description: 'User profile data + audit entries tied to the user' })
  dsar(@Req() req: any) { return this.gdpr.dsar(req.user?.sub || 'me') }

  @ApiOperation({ summary: 'Rectification (update user profile)' })
  @Post('rectify')
  rectify(@Req() req: any, @Body() body: { name?: string }) { return this.gdpr.rectify(req.user?.sub || 'me', body) }

  @ApiOperation({ summary: 'Erasure request', description: 'Marks request and responds with policy explanation templates' })
  @Post('erasure-request')
  erasure(@Req() req: any, @Body() body: { reason?: string }) { return this.gdpr.erasureRequest(req.user?.sub || 'me', body?.reason) }

  @ApiOperation({ summary: 'List documents eligible for disposal (Admin/QMS)' })
  @UseGuards(RolesGuard)
  @Roles('Admin','QMS')
  @Get('retention/eligible')
  eligible() { return this.gdpr.eligibleForDisposal() }

  @ApiOperation({ summary: 'Run retention timer check now (Admin/QMS)' })
  @UseGuards(RolesGuard)
  @Roles('Admin','QMS')
  @Post('retention/run')
  run() { return this.gdpr.runRetentionCheck() }
}

