import { HealthIndicatorResult, HttpHealthIndicator } from '@nestjs/terminus';
import { PrometheusService } from '../service/prometheus.service';
import { IHealthIndicator } from '../interface/ihealth-indicator.interface';
import { AbstractBaseHealthIndicator } from './abstract-base-health.indicator';
import { HttpOption } from './custom-http-health.indicator';

export class AppHealthIndicator extends AbstractBaseHealthIndicator implements IHealthIndicator {
  constructor(
    promClientService: PrometheusService,
    protected readonly http: HttpHealthIndicator,
    protected readonly options?: HttpOption,
  ) {
    super('app', promClientService);
    this.http = http;
    this.registerMetrics();
    this.registerGauges();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    let url = 'http://localhost:5000';
    if (this.options?.url) {
      url = this.options.url;
    }
    const result = await this.http.pingCheck(this.name, url, this.options);
    this.updatePrometheusData(true);
    return result;
  }
}
