import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let code = 'internal_error'
    let message = 'An unexpected error occurred'
    let details: any = undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const resp: any = exception.getResponse()
      code = resp?.code || exception.name || 'error'
      message = resp?.message || exception.message
      details = resp?.details
    } else if (exception?.code === '23505' || /duplicate key/i.test(exception?.message || '')) {
      // Postgres unique violation
      status = HttpStatus.CONFLICT
      code = 'duplicate'
      message = 'Resource already exists'
      details = { hint: 'Use a different doc_id or check for existing document' }
    } else if (exception?.name === 'BadRequestException') {
      status = HttpStatus.BAD_REQUEST
      code = 'bad_request'
      message = exception?.message
    } else {
      message = exception?.message || message
    }

    res.status(status).json({ code, message, details })
  }
}

