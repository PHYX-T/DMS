import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

@Injectable()
export class FilesService {
  private s3 = new S3Client({ region: process.env.S3_REGION, endpoint: process.env.S3_ENDPOINT, forcePathStyle: !!process.env.S3_ENDPOINT })
  private buckets = { pdf: process.env.S3_BUCKET_PDF || 'dms-pdf', source: process.env.S3_BUCKET_SOURCE || 'dms-source', temp: process.env.S3_BUCKET_TEMP || 'dms-temp' }

  // Policy helpers — wire proper ABAC here
  private ensurePdfAccess(user: any, doc: any) {
    if (user?.role === 'ExternalAuditor' || user?.role === 'EndUser') {
      if (!doc?.latest_approved) throw new ForbiddenException('approved_only')
    }
  }
  private ensureSourceAccess(user: any) {
    if (!user || !['DocumentController','Admin','QMS'].includes(user.role)) throw new ForbiddenException('restricted')
  }

  async signedPdfUrl(id: string, version?: string) {
    // Load doc from DB (stub)
    const doc = { latest_approved: true }
    const user = { role: 'EndUser' }
    this.ensurePdfAccess(user, doc)
    const key = this.makePdfKey(id, version || 'latest')
    const url = await getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.buckets.pdf, Key: key }), { expiresIn: 60 })
    return { url }
  }

  async signedSourceUrl(id: string, version?: string) {
    const user = { role: 'Admin' } // stub — read from request context
    this.ensureSourceAccess(user)
    const key = this.makeSourceKey(id, version || 'latest')
    const url = await getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.buckets.source, Key: key }), { expiresIn: 60 })
    return { url }
  }

  async createUploadUrls(body: { documentId: string; version: string; files: { kind: 'pdf'|'source'; contentType: string; size: number }[] }) {
    // Validate kinds, MIME, size
    for (const f of body.files) {
      if (!['pdf','source'].includes(f.kind)) throw new BadRequestException('invalid_kind')
      const max = f.kind === 'pdf' ? 50 * 1024 * 1024 : 100 * 1024 * 1024
      if (f.size <= 0 || f.size > max) throw new BadRequestException('invalid_size')
      if (f.kind === 'pdf' && !/^application\/pdf$/.test(f.contentType)) throw new BadRequestException('mime')
      if (f.kind === 'source' && !/(msword|officedocument|odt|markdown|text)/.test(f.contentType)) throw new BadRequestException('mime')
    }
    const uploads = [] as any[]
    for (const f of body.files) {
      const tempKey = this.makeTempKey(body.documentId, body.version, f.kind)
      const url = await getSignedUrl(this.s3, new PutObjectCommand({ Bucket: this.buckets.temp, Key: tempKey, ContentType: f.contentType }), { expiresIn: 300 })
      uploads.push({ kind: f.kind, url })
    }
    return { uploads }
  }

  async finalize(body: { documentId: string; version: string; uploads: { kind: 'pdf'|'source'; key: string; sha256: string }[] }) {
    // AV scan (stub) — in production, trigger worker and await result or poll
    const infected = false
    if (infected) throw new BadRequestException('infected')
    for (const u of body.uploads) {
      const destKey = u.kind === 'pdf' ? this.makePdfKey(body.documentId, body.version) : this.makeSourceKey(body.documentId, body.version)
      await this.s3.send(new CopyObjectCommand({ Bucket: u.kind === 'pdf' ? this.buckets.pdf : this.buckets.source, CopySource: `${this.buckets.temp}/${u.key}`, Key: destKey }))
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.buckets.temp, Key: u.key }))
      // Persist checksum and keys to DB (stub)
    }
    return { ok: true }
  }

  private makePdfKey(docId: string, version: string) { return `${docId}/v${version}/pdf.pdf` }
  private makeSourceKey(docId: string, version: string) { return `${docId}/v${version}/source` }
  private makeTempKey(docId: string, version: string, kind: string) { return `temp/${docId}/v${version}/${kind}-${crypto.randomUUID()}` }
}
