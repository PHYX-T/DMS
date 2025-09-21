import { Module } from '@nestjs/common'
import { ConfigModule as NestConfig } from '@nestjs/config'
import { z } from 'zod'
import { AppConfigService } from './config.service.js'

const bool = (def = false) => z.preprocess((v) => (typeof v === 'string' ? v.toLowerCase() === 'true' : !!v), z.boolean().default(def))
const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  APP_ENV: z.enum(['dev','staging','prod']).default('dev'),
  PORT: z.string().optional(),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().optional(),

  // Storage
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_PDF: z.string().optional(),
  S3_BUCKET_SOURCE: z.string().optional(),
  S3_BUCKET_TEMP: z.string().optional(),

  // Search
  SEARCH_ENGINE: z.enum(['opensearch','pg']).default('pg'),
  SEARCH_INDEX_DOCS: z.string().default('dms-docs'),

  // OIDC / SSO
  OIDC_ISSUER: z.string().optional(),
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET: z.string().optional(),
  OIDC_REDIRECT_URI: z.string().optional(),
  OIDC_TENANT: z.string().optional(),

  // Feature flags
  MINOR_APPROVAL_ENABLED: bool(false),
  HIGH_CONTRAST_UI_BANNER: bool(false),
  PG_FTS_FALLBACK: bool(true),
  AUDITOR_PORTAL_ENABLED: bool(true),
})

@Module({
  imports: [
    NestConfig.forRoot({
      isGlobal: true,
      validate: (cfg) => {
        const parsed = schema.safeParse(cfg)
        if (!parsed.success) throw new Error('Invalid configuration: ' + JSON.stringify(parsed.error.format()))
        return parsed.data
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
