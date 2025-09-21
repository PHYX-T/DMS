import { S3Client } from '@aws-sdk/client-s3'

export function createS3() {
  return new S3Client({ region: process.env.S3_REGION, endpoint: process.env.S3_ENDPOINT, forcePathStyle: !!process.env.S3_ENDPOINT })
}

