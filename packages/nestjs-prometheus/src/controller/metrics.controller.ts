import { Controller, Get } from '@nestjs/common';
import { MetricsService } from '../service/metrics.service';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('metrics')
@ApiExcludeController()
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  public metrics(): Promise<string> {
    return this.metricsService.metrics;
  }
}
