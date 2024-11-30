import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP', { timestamp: true });

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path: url } = request;
    const userAgent = request.get('user-agent') || '';
    const id = randomUUID();

    this.logger.log(`START ${id} ${method} ${url} - ${userAgent} ${ip}`);

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      this.logger.log(
        `END ${id} ${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
