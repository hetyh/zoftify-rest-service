import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP', { timestamp: true });

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    response.on('close', () => {
      const { statusCode } = response;
      const endTime = Date.now();
      this.logger.log(
        `START ${startTime} END ${endTime} - ${method} ${path} ${statusCode} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
