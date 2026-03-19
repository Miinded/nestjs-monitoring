import { HealthIndicatorResult, HttpHealthIndicator } from '@nestjs/terminus';
import { PrometheusService } from '../service/prometheus.service';
import { IHealthIndicator } from '../interface/ihealth-indicator.interface';
import { AbstractBaseHealthIndicator } from './abstract-base-health.indicator';
import {
  type AxiosRequestConfig,
  type AxiosResponse,
} from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { Observable } from 'rxjs';

interface HttpClientLike {
  request<T = any>(config: any): Observable<AxiosResponse<T>>;
}

export type HttpOption = AxiosRequestConfig & {
  httpClient?: HttpClientLike;
};

export type HttpOptionUrl = Omit<HttpOption, 'url'> & {
  url: string;
};
export class CustomHttpHealthIndicator extends AbstractBaseHealthIndicator implements IHealthIndicator {
  protected readonly http: HttpHealthIndicator | undefined;
  protected key!: string;
  protected options: HttpOption;

  constructor(promClientService: PrometheusService, http: HttpHealthIndicator, name: string, options: HttpOptionUrl) {
    super(`http_${name}`, promClientService);
    this.http = http;
    this.options = options;
    this.registerMetrics();
    this.registerGauges();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const result = await this.http!.pingCheck(this.name, this.options.url as string, this.options);
    this.updatePrometheusData(true);
    return result;
  }
}
