import { Injectable } from '@nestjs/common';
import { HealthService } from '../service/health.service';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class MetricsService {
  public get metrics(): Promise<string> {
    this.healthService.checkForMetrics();

    return this.promClientService.metrics;
  }

  constructor(
    private promClientService: PrometheusService,
    private healthService: HealthService,
  ) {}
}
