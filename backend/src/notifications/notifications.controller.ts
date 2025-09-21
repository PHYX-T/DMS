import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { NotificationsService } from './notifications.service.js'

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notify: NotificationsService) {}

  @ApiOperation({ summary: 'List in-app notifications for current user' })
  @Get()
  @ApiOkResponse({ description: 'Notifications' })
  list(@Req() req: any) { return this.notify.list(req.user?.sub || 'me') }

  @ApiOperation({ summary: 'Mark notifications as read' })
  @Post('mark-read')
  markRead(@Req() req: any, @Body() body: { ids: string[] }) { return this.notify.markRead(req.user?.sub || 'me', body.ids || []) }

  @ApiOperation({ summary: 'Get digest preferences' })
  @Get('prefs')
  prefs(@Req() req: any) { return this.notify.getPrefs(req.user?.sub || 'me') }

  @ApiOperation({ summary: 'Update digest preferences' })
  @Post('prefs')
  setPrefs(@Req() req: any, @Body() body: { digest: 'off'|'daily'|'weekly'; time?: string }) { return this.notify.setPrefs(req.user?.sub || 'me', body) }

  @ApiOperation({ summary: 'Send test notification' })
  @Post('test')
  test(@Req() req: any) { return this.notify.trigger('approval_pending', req.user?.sub || 'me', { title: 'Test document' }) }
}

