import { HealthIndicatorResult, TypeOrmHealthIndicator, TypeOrmPingCheckSettings } from '@nestjs/terminus';
import { PrometheusService } from '../service/prometheus.service';
import { IHealthIndicator } from '../interface/ihealth-indicator.interface';
import { AbstractBaseHealthIndicator } from './abstract-base-health.indicator';

export class DatabaseHealthIndicator extends AbstractBaseHealthIndicator implements IHealthIndicator {
  protected readonly db: TypeOrmHealthIndicator | undefined;
  private options?: TypeOrmPingCheckSettings;

  constructor(promClientService: PrometheusService, db: TypeOrmHealthIndicator, options?: TypeOrmPingCheckSettings) {
    super('database', promClientService);
    this.db = db;
    this.options = options;
    this.registerMetrics();
    this.registerGauges();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const result = await this.db!.pingCheck(this.name, this.options);
    this.updatePrometheusData(true);
    return result;
  }
}
