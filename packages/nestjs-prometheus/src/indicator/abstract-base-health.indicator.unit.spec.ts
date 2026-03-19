import { PrometheusService } from '../service/prometheus.service';
import { AbstractBaseHealthIndicator } from './abstract-base-health.indicator';

class TestableHealthIndicator extends AbstractBaseHealthIndicator {
  constructor(name: string, promClientService?: PrometheusService) {
    super(name, promClientService);
  }

  async isHealthy(): Promise<any> {
    return this.getStatus(this.name, true);
  }
}

describe('AbstractBaseHealthIndicator', () => {
  let indicator: TestableHealthIndicator;
  let mockPrometheusService: jest.Mocked<PrometheusService>;

  beforeEach(() => {
    mockPrometheusService = {
      registerMetrics: jest.fn().mockReturnValue({
        startTimer: jest.fn().mockReturnValue(jest.fn()),
      }),
      registerGauge: jest.fn().mockReturnValue({
        set: jest.fn(),
      }),
    } as any;
    indicator = new TestableHealthIndicator('test-indicator', mockPrometheusService);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should normalize name with special characters', () => {
    const indicator2 = new TestableHealthIndicator('my-test.indicator', mockPrometheusService);
    expect(indicator2.name).toBe('my_test_indicator');
  });

  it('should have correct name', () => {
    expect(indicator.name).toBe('test_indicator');
  });

  describe('registerMetrics', () => {
    it('should register metrics when promClientService exists', () => {
      indicator['registerMetrics']();
      expect(mockPrometheusService.registerMetrics).toHaveBeenCalled();
      expect(indicator.customMetricsRegistered).toBe(true);
    });

    it('should not register metrics when promClientService is undefined', () => {
      const indicatorNoService = new TestableHealthIndicator('test');
      indicatorNoService['registerMetrics']();
      expect(indicatorNoService.customMetricsRegistered).toBe(false);
    });
  });

  describe('registerGauges', () => {
    it('should register gauges when promClientService exists', () => {
      indicator['registerGauges']();
      expect(mockPrometheusService.registerGauge).toHaveBeenCalled();
      expect(indicator.customGaugesRegistered).toBe(true);
    });

    it('should not register gauges when promClientService is undefined', () => {
      const indicatorNoService = new TestableHealthIndicator('test');
      indicatorNoService['registerGauges']();
      expect(indicatorNoService.customGaugesRegistered).toBe(false);
    });
  });

  describe('updatePrometheusData', () => {
    it('should update state when connection state changes', () => {
      indicator['registerMetrics']();
      indicator['registerGauges']();
      indicator.updatePrometheusData(true);
      expect(indicator['stateIsConnected']).toBe(true);
    });

    it('should not update when state is same', () => {
      indicator['stateIsConnected'] = true;
      const originalState = indicator['stateIsConnected'];
      indicator.updatePrometheusData(true);
      expect(indicator['stateIsConnected']).toBe(originalState);
    });
  });

  describe('reportUnhealthy', () => {
    it('should return unhealthy status', () => {
      const result = indicator.reportUnhealthy();
      expect(result).toEqual({
        test_indicator: { status: 'down' },
      });
    });
  });
});
