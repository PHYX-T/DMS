import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { SearchService } from './search.service.js'

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @ApiOperation({ summary: 'Search documents', description: 'Text + filters; paginated; facets in response; p95 < 2s goal.' })
  @Get()
  @ApiOkResponse({ description: 'Search result {items,total,facets}' })
  async q(@Req() req: any, @Query() q: any) { return this.search.query(req.user, q) }
}
