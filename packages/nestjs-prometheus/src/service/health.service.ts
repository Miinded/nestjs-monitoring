import { Injectable, Logger } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { IHealthIndicator } from '../interface/ihealth-indicator.interface';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private listOfThingsToMonitor: IHealthIndicator[],
  ) {}

  public async check(): Promise<HealthCheckResult | undefined> {
    return await this.health.check(this.listOfThingsToMonitor.map((apiIndicator: IHealthIndicator) => async () => apiIndicator.isHealthy()));
  }

  @HealthCheck({ noCache: true, swaggerDocumentation: false })
  public async checkForMetrics(): Promise<HealthCheckResult | undefined> {
    return await this.health.check(
      this.listOfThingsToMonitor.map((apiIndicator: IHealthIndicator) => async () => {
        try {
          return await apiIndicator.isHealthy();
        } catch (e) {
          Logger.error('Health Check error for service : ' + apiIndicator.name, e);
          return apiIndicator.reportUnhealthy();
        }
      }),
    );
  }
}
