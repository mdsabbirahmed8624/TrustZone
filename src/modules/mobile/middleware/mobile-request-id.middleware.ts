import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MobileRequestIdMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    req.requestId =
      req.headers['x-request-id'] ||
      `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    next();
  }
}
