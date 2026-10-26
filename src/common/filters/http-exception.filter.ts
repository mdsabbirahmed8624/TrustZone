import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    // Log the exception details internally
    this.logger.error(
      `${request.method} ${request.url} failed. Error: ${exception instanceof Error ? exception.message : JSON.stringify(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Map Prisma Database Errors to Clean API Errors (Security: No SQL leaks)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `Unique constraint failed on field: ${(exception.meta?.target as string[])?.join(', ') || 'unknown'}`;
          code = 'UNIQUE_CONSTRAINT_FAILED';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed. Related record not found.';
          code = 'FOREIGN_KEY_CONSTRAINT_FAILED';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message =
            (exception.meta?.cause as string) ||
            'Requested record was not found.';
          code = 'RECORD_NOT_FOUND';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database operation failed due to invalid constraints.';
          code = `DATABASE_ERROR_${exception.code}`;
          break;
      }
    } else if (
      exception instanceof Prisma.PrismaClientValidationError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid database query parameters.';
      code = 'DATABASE_VALIDATION_ERROR';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent = exception.getResponse() as any;
      message =
        typeof resContent === 'object' && resContent.message
          ? resContent.message
          : exception.message;
      code =
        typeof resContent === 'object' && resContent.error
          ? resContent.error.replace(/\s+/g, '_').toUpperCase()
          : 'HTTP_EXCEPTION';
    } else if (
      exception instanceof Error &&
      process.env.NODE_ENV !== 'production'
    ) {
      message = exception.message;
    }

    const formattedMessage = Array.isArray(message)
      ? 'Request parameters failed validation.'
      : message;

    response.status(status).json({
      success: false,
      message: formattedMessage,
      error: {
        code,
        message: formattedMessage,
        details: Array.isArray(message)
          ? message.map((msg) => ({
              field: msg.split(' ')[0] || 'unknown',
              issue: msg,
            }))
          : undefined,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
