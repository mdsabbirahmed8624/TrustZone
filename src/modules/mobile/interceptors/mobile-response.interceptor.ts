import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class MobileResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<any>();

    return next.handle().pipe(
      map((response) => {
        // If response is already formatted as a standard API response with requestId, keep it
        if (
          response &&
          typeof response === 'object' &&
          'success' in response &&
          'requestId' in response
        ) {
          return response;
        }

        let message = 'Operation successful';
        let data = response;

        if (response && typeof response === 'object') {
          if ('message' in response) {
            message = response.message;
          }
          if ('data' in response) {
            data = response.data;
          }
        }

        return {
          success: true,
          message,
          data: data !== undefined ? data : null,
          errors: null,
          timestamp: new Date().toISOString(),
          requestId: request.requestId || 'system-request-id',
        };
      }),
    );
  }
}
