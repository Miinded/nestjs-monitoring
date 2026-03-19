import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrometheusHistogram, PrometheusService } from '../service/prometheus.service';
import { Logger } from '@nestjs/common';
import { Gauge } from 'prom-client';

const TAG = 'HealthCheck';

export abstract class AbstractBaseHealthIndicator extends HealthIndicator {
  public readonly name: string;
  /**
   *
   */
  constructor(name: string, promClientService?: PrometheusService) {
    super();
    this.name = name.replace(/[- \.]/g, '_');
    this.promClientService = promClientService;
  }

  protected help(): string {
    return 'Status of ' + this.name;
  }
  public callMetrics: any;
  protected promClientService: PrometheusService | undefined;
  protected readonly labelNames = ['status'];
  protected readonly buckets = [1];
  protected stateIsConnected = false;

  private metricsRegistered = false;
  private gaugesRegistered = false;
  private gauge: Gauge<string> | undefined;

  protected registerMetrics(): void {
    if (this.promClientService) {
      Logger.debug('Register metrics histogram for: ' + this.name, TAG, true);
      this.metricsRegistered = true;
      const histogram: PrometheusHistogram = this.promClientService.registerMetrics(
        this.name,
        this.help(),
        this.labelNames,
        this.buckets,
      );
      this.callMetrics = histogram.startTimer();
    }
  }

  protected registerGauges(): void {
    if (this.promClientService) {
      Logger.debug('Register metrics gauge for: ' + this.name, TAG, true);
      this.gaugesRegistered = true;
      this.gauge = this.promClientService.registerGauge(this.name, this.help());
    }
  }

  public updatePrometheusData(isConnected: boolean): void {
    if (this.stateIsConnected !== isConnected) {
      this.stateIsConnected = isConnected;

      if (this.metricsRegistered) {
        this.callMetrics({ status: this.stateIsConnected ? 1 : 0 });
      }

      if (this.gaugesRegistered) {
        this.gauge?.set(this.stateIsConnected ? 1 : 0);
      }
    }
  }

  public abstract isHealthy(): Promise<HealthIndicatorResult>;

  public reportUnhealthy(): HealthIndicatorResult {
    this.updatePrometheusData(false);
    return this.getStatus(this.name, false);
  }

  public get customMetricsRegistered(): boolean {
    return this.metricsRegistered;
  }

  public get customGaugesRegistered(): boolean {
    return this.gaugesRegistered;
  }
}
