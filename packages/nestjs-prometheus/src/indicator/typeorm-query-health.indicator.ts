import { HealthIndicatorResult, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { PrometheusService } from '../service/prometheus.service';
import { IHealthIndicator } from '../interface/ihealth-indicator.interface';
import { AbstractBaseHealthIndicator } from './abstract-base-health.indicator';
import { DataSource, DataSourceOptions } from 'typeorm';

export type TypeormQueryCallback = (results: unknown[]) => { result: boolean; data?: { [key: string]: any } };

export class TypeormQueryHealthIndicator extends AbstractBaseHealthIndicator implements IHealthIndicator {
  protected readonly db: TypeOrmHealthIndicator | undefined;
  private readonly options: DataSourceOptions;

  private query: string;
  private parameters: any[];
  private callback: TypeormQueryCallback;

  constructor(promClientService: PrometheusService, options: DataSourceOptions, name: string, query: string, parameters: any[], callback: TypeormQueryCallback) {
    super(`query_${name}`, promClientService);
    this.options = options;
    this.query = query;
    this.callback = callback;
    this.parameters = parameters;
    this.registerMetrics();
    this.registerGauges();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const connection = await new DataSource(this.options).initialize();
    const dbResults = await connection.query(this.query, this.parameters);
    const result = this.callback(dbResults);
    this.updatePrometheusData(result.result);
    return this.getStatus(this.name, result.result, result.data);
  }
}
