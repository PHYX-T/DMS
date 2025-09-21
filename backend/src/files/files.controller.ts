import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { FilesService } from './files.service.js'

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @ApiOperation({ summary: 'Get signed URL for PDF', description: 'Masks storage; redirects EndUser/Auditor to approved versions only.' })
  @Get('pdf/:id')
  @ApiOkResponse({ description: 'Signed URL object', schema: { properties: { url: { type: 'string' } } } })
  signed(@Param('id') id: string, @Query('v') v?: string) { return this.files.signedPdfUrl(id, v) }

  @ApiOperation({ summary: 'Get signed URL for Source (restricted)' })
  @Get('source/:id')
  @ApiOkResponse({ description: 'Signed URL object', schema: { properties: { url: { type: 'string' } } } })
  source(@Param('id') id: string, @Query('v') v?: string) { return this.files.signedSourceUrl(id, v) }

  @ApiOperation({ summary: 'Request pre-signed upload URLs (temporary bucket)', description: 'Validates MIME and size; AV scan occurs out-of-band before finalization.' })
  @Post('upload-urls')
  @ApiOkResponse({ description: 'Upload URLs', schema: { properties: { uploads: { type: 'array', items: { properties: { kind: { type: 'string' }, url: { type: 'string' } } } } } } })
  uploadUrls(@Body() body: { documentId: string; version: string; files: { kind: 'pdf'|'source'; contentType: string; size: number }[] }) {
    return this.files.createUploadUrls(body)
  }

  @ApiOperation({ summary: 'Finalize upload (scan + persist)', description: 'Moves objects from temp to permanent after AV scan. Records checksums and keys; never returns keys to clients.' })
  @Post('finalize')
  finalize(@Body() body: { documentId: string; version: string; uploads: { kind: 'pdf'|'source'; key: string; sha256: string }[] }) {
    return this.files.finalize(body)
  }
}
