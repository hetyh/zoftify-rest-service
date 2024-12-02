import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from './common/decorators';

@Controller()
export class AppController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Public()
  @Get('health')
  @HealthCheck()
  checkHealth() {
    return this.health.check([async () => this.db.pingCheck('typeorm')]);
  }
}
