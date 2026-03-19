import { HealthIndicatorResult, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { RedisOptions, Transport } from '@nestjs/microservices';
import { PrometheusService } from '../service/prometheus.service';
import { IHealthIndicator } from '../interface/ihealth-indicator.interface';
import { AbstractBaseHealthIndicator } from './abstract-base-health.indicator';

export type RedisConfig = {
  host: string;
  password?: string;
  db?: number;
  port: number;
};

export class RedisHealthIndicator extends AbstractBaseHealthIndicator implements IHealthIndicator {
  protected readonly microservice: MicroserviceHealthIndicator | undefined;

  constructor(
    promClientService: PrometheusService,
    microservice: MicroserviceHealthIndicator,
    name: string,
    protected readonly options: RedisConfig,
  ) {
    super(`redis_${name}`, promClientService);
    this.microservice = microservice;
    this.options = options;
    this.registerMetrics();
    this.registerGauges();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const result = await this.microservice!.pingCheck<RedisOptions>(this.name, {
      transport: Transport.REDIS,
      options: {
        ...this.options,
      },
    });
    this.updatePrometheusData(true);
    return result;
  }
}
