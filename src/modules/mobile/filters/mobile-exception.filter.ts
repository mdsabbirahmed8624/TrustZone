import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class MobileExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('MobileExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<any>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    this.logger.error(
      `Mobile API ${request.method} ${request.url} failed. Error: ${
        exception instanceof Error
          ? exception.message
          : JSON.stringify(exception)
      }`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent = exception.getResponse() as any;

      if (typeof resContent === 'object') {
        message = resContent.message || exception.message;
        if (resContent.error) {
          errors = resContent.error;
        }
        // Validation errors return details or message as array
        if (Array.isArray(resContent.message)) {
          message = 'Validation failed';
          errors = resContent.message.map((msg: string) => ({
            field: msg.split(' ')[0] || 'unknown',
            issue: msg,
          }));
        }
      } else {
        message = resContent || exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `Unique constraint failed on field: ${(exception.meta?.target as string[])?.join(', ')}`;
          errors = { code: 'UNIQUE_CONSTRAINT_FAILED' };
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message =
            (exception.meta?.cause as string) ||
            'Requested record was not found.';
          errors = { code: 'RECORD_NOT_FOUND' };
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database operation failed.';
          errors = { code: `DATABASE_ERROR_${exception.code}` };
          break;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      message,
      data: null,
      errors: errors || { code: 'INTERNAL_SERVER_ERROR', message },
      timestamp: new Date().toISOString(),
      requestId: request.requestId || 'system-request-id',
    });
  }
}
