import { HealthIndicatorResult, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { type RmqUrl } from '@nestjs/microservices/external/rmq-url.interface';
import { PrometheusService } from '../service/prometheus.service';
import { IHealthIndicator } from '../interface/ihealth-indicator.interface';
import { AbstractBaseHealthIndicator } from './abstract-base-health.indicator';

export class RmqHealthIndicator extends AbstractBaseHealthIndicator implements IHealthIndicator {
  protected readonly microservice: MicroserviceHealthIndicator | undefined;

  constructor(
    promClientService: PrometheusService,
    microservice: MicroserviceHealthIndicator,
    name: string,
    private readonly options: RmqUrl,
  ) {
    super(`rmq_${name}`, promClientService);
    this.microservice = microservice;
    this.options = options;
    this.registerMetrics();
    this.registerGauges();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const result = await this.microservice!.pingCheck<RmqOptions>(this.name, {
      transport: Transport.RMQ,
      options: {
        urls: [this.options],
      },
    });
    this.updatePrometheusData(true);

    return result;
  }
}
