import { DynamicModule, Module, ModuleMetadata, Provider } from '@nestjs/common';
import { PrometheusService } from './service/prometheus.service';
import { HealthController } from './controller/health.controller';
import { HealthService } from './service/health.service';
import { MetricsController } from './controller/metrics.controller';
import { HealthCheckService, TerminusModule } from '@nestjs/terminus';
import { IHealthIndicator } from './interface/ihealth-indicator.interface';
import { PROMETHEUS_INDICATORS_LIST } from './prometheus.constants';
import { MetricsService } from './service';

export type PrometheusAsyncConfig = {
  name: string;
  useFactory: (...args: any[]) => Promise<IHealthIndicator[]> | IHealthIndicator[];
  inject?: any[];
} & Pick<ModuleMetadata, 'imports'>;

@Module({})
export class PrometheusModule {
  static registerAsync(options: PrometheusAsyncConfig): DynamicModule {
    const providers: Provider[] = [
      {
        provide: PrometheusService,
        useFactory: () => new PrometheusService(options.name),
      },
      {
        provide: PROMETHEUS_INDICATORS_LIST,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: HealthService,
        useFactory: (healthCheckService: HealthCheckService, providers: IHealthIndicator[]) => {
          return new HealthService(healthCheckService, providers);
        },
        inject: [HealthCheckService, PROMETHEUS_INDICATORS_LIST],
      },
      MetricsService,
    ];

    return {
      module: PrometheusModule,
      controllers: [HealthController, MetricsController],
      imports: [TerminusModule, ...(options?.imports || [])],
      providers: providers,
      exports: [...providers],
    };
  }
}
