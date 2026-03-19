import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckError, HealthCheckResult } from '@nestjs/terminus';
import { HealthService } from '../service/health.service';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('health')
@ApiExcludeController()
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @HealthCheck()
  public async check(): Promise<HealthCheckResult | undefined | HealthCheckError> {
    return this.healthService.check();
  }
}
