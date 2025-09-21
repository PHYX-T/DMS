import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { ReportsService } from './reports.service.js'
import { Throttle } from '@nestjs/throttler'

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('QMS','Admin')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @ApiOperation({ summary: 'KPIs overview', description: 'from/to date range (YYYY-MM-DD), optional department and type filters' })
  @Get('kpis')
  @ApiOkResponse({ description: 'KPIs', schema: { properties: { latestApprovedPct: { type: 'number' }, pendingReview: { type: 'number' }, overdueReview: { type: 'number' }, approachingReview: { type: 'number' }, avgCycleTimeDays: { type: 'number' } } } })
  kpis(@Query('from') from?: string, @Query('to') to?: string, @Query('dept') dept?: string, @Query('type') type?: string) {
    return this.reports.kpis({ from, to, dept, type })
  }

  @ApiOperation({ summary: 'Trends', description: 'metric=cycle_time; grouped by month and optionally department' })
  @Get('trends')
  @ApiOkResponse({ description: 'Trend series', schema: { properties: { series: { type: 'array', items: { properties: { period: { type: 'string' }, dept: { type: 'string' }, value: { type: 'number' } } } } } } })
  trends(@Query('metric') metric = 'cycle_time', @Query('dept') dept?: string) {
    return this.reports.trends({ metric, dept })
  }

  @ApiOperation({ summary: 'Export report (PDF/Excel stub)', description: 'Enqueues job and returns job id + (stub) download link on completion' })
  @Post('export')
  @Throttle(5, 60)
  @ApiOkResponse({ description: 'Export job', schema: { properties: { jobId: { type: 'string' }, link: { type: 'string' } } } })
  export(@Body() body: { format: 'pdf'|'xlsx'; from?: string; to?: string; dept?: string; type?: string }) {
    return this.reports.export(body)
  }
}
