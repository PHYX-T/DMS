import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { ValidationPipe } from '@nestjs/common'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { TracingInterceptor } from './common/interceptors/tracing.interceptor.js'
import { MetricsModule } from './metrics/metrics.module.js'
import { MetricsService } from './metrics/metrics.service.js'
import { LoggingMiddleware } from './common/middleware/logging.middleware.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }))
  app.useGlobalFilters(new AllExceptionsFilter())
  // Request logging + tracing/metrics
  app.use(new LoggingMiddleware().use)
  const metrics = app.select(MetricsModule).get(MetricsService)
  app.useGlobalInterceptors(new TracingInterceptor(metrics))

  const config = new DocumentBuilder()
    .setTitle('DMS API')
    .setDescription('Document Management & Control API (ISO 9001, GDPR, WORM audit)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config, { extraModels: [] })
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(process.env.PORT || 3000)
}
bootstrap()
