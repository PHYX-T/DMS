import { Injectable } from '@nestjs/common'

type AppEnv = 'dev'|'staging'|'prod'

@Injectable()
export class AppConfigService {
  get nodeEnv() { return process.env.NODE_ENV || 'development' }
  get appEnv(): AppEnv { return (process.env.APP_ENV as AppEnv) || 'dev' }
  get dbUrl() { return process.env.DATABASE_URL || '' }
  // Feature flags
  get flags() {
    return {
      minorApproval: (process.env.MINOR_APPROVAL_ENABLED || 'false').toLowerCase() === 'true',
      highContrastBanner: (process.env.HIGH_CONTRAST_UI_BANNER || 'false').toLowerCase() === 'true',
      pgFtsFallback: (process.env.PG_FTS_FALLBACK || 'true').toLowerCase() === 'true',
      auditorPortal: (process.env.AUDITOR_PORTAL_ENABLED || 'true').toLowerCase() === 'true',
    }
  }
  // Storage buckets
  get buckets() {
    return {
      pdf: process.env.S3_BUCKET_PDF || 'dms-pdf',
      source: process.env.S3_BUCKET_SOURCE || 'dms-source',
      temp: process.env.S3_BUCKET_TEMP || 'dms-temp',
    }
  }
  // Search
  get search() {
    return { engine: (process.env.SEARCH_ENGINE || 'pg').toLowerCase(), indexDocs: process.env.SEARCH_INDEX_DOCS || 'dms-docs' }
  }
  // OIDC
  get oidc() {
    return { issuer: process.env.OIDC_ISSUER, clientId: process.env.OIDC_CLIENT_ID, redirectUri: process.env.OIDC_REDIRECT_URI, tenant: process.env.OIDC_TENANT }
  }
}

