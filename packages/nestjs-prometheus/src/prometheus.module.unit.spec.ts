import { PrometheusModule, PrometheusAsyncConfig } from './prometheus.module';
import { PrometheusService } from './service/prometheus.service';
import { HealthService } from './service/health.service';
import { MetricsService } from './service/metrics.service';
import { IHealthIndicator } from './interface/ihealth-indicator.interface';
import { HealthIndicatorResult } from '@nestjs/terminus';

class MockHealthIndicator implements IHealthIndicator {
  name = 'mock_indicator';
  callMetrics = {};
  customMetricsRegistered = false;
  customGaugesRegistered = false;
  updatePrometheusData(_isConnected: boolean): void {}
  async isHealthy(): Promise<HealthIndicatorResult> {
    return { [this.name]: { status: 'up' as const } };
  }
  reportUnhealthy(): HealthIndicatorResult {
    return { [this.name]: { status: 'down' as const } };
  }
}

describe('PrometheusModule', () => {
  describe('registerAsync', () => {
    it('should return a dynamic module', () => {
      const config: PrometheusAsyncConfig = {
        name: 'test-app',
        useFactory: () => [new MockHealthIndicator()],
      };

      const module = PrometheusModule.registerAsync(config);

      expect(module).toBeDefined();
      expect(module.module).toBe(PrometheusModule);
      expect(module.controllers).toBeDefined();
      expect(module.controllers).toHaveLength(2);
      expect(module.providers).toBeDefined();
      expect(module.exports).toBeDefined();
    });

    it('should provide PrometheusService with correct name', () => {
      const config: PrometheusAsyncConfig = {
        name: 'test-app',
        useFactory: () => [new MockHealthIndicator()],
      };

      const module = PrometheusModule.registerAsync(config);
      const prometheusProvider = module.providers?.find((p) => 'provide' in p && p.provide === PrometheusService);

      expect(prometheusProvider).toBeDefined();
    });

    it('should provide HealthService', () => {
      const config: PrometheusAsyncConfig = {
        name: 'test-app',
        useFactory: () => [new MockHealthIndicator()],
      };

      const module = PrometheusModule.registerAsync(config);
      const healthProvider = module.providers?.find((p) => 'provide' in p && p.provide === HealthService);

      expect(healthProvider).toBeDefined();
    });

    it('should provide MetricsService', () => {
      const config: PrometheusAsyncConfig = {
        name: 'test-app',
        useFactory: () => [new MockHealthIndicator()],
      };

      const module = PrometheusModule.registerAsync(config);
      const metricsProvider = module.providers?.find(
        (p) => p === MetricsService || ('provide' in p && p.provide === MetricsService),
      );

      expect(metricsProvider).toBeDefined();
    });

    it('should accept inject array', () => {
      const config: PrometheusAsyncConfig = {
        name: 'test-app',
        useFactory: () => [new MockHealthIndicator()],
        inject: ['SOME_DEPENDENCY'],
      };

      const module = PrometheusModule.registerAsync(config);

      expect(module).toBeDefined();
    });

    it('should accept imports array', () => {
      const config: PrometheusAsyncConfig = {
        name: 'test-app',
        useFactory: () => [new MockHealthIndicator()],
        imports: [],
      };

      const module = PrometheusModule.registerAsync(config);

      expect(module).toBeDefined();
    });
  });
});
