import { PrometheusService } from '../service/prometheus.service';
import { RmqHealthIndicator } from './rmq-health.indicator';
import { MicroserviceHealthIndicator } from '@nestjs/terminus';

describe('RmqHealthIndicator', () => {
  let indicator: RmqHealthIndicator;
  let mockPrometheusService: jest.Mocked<PrometheusService>;
  let mockMicroserviceIndicator: jest.Mocked<MicroserviceHealthIndicator>;
  const rmqOptions = { hostname: 'localhost', port: 5672, username: 'guest', password: 'guest' };

  beforeEach(() => {
    mockPrometheusService = {
      registerMetrics: jest.fn().mockReturnValue({
        startTimer: jest.fn().mockReturnValue(jest.fn()),
      }),
      registerGauge: jest.fn().mockReturnValue({
        set: jest.fn(),
      }),
    } as any;

    mockMicroserviceIndicator = {
      pingCheck: jest.fn().mockResolvedValue({ rmq_test: { status: 'up' } }),
    } as any;

    indicator = new RmqHealthIndicator(mockPrometheusService, mockMicroserviceIndicator, 'test', rmqOptions);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should have correct name with prefix', () => {
    expect(indicator.name).toBe('rmq_test');
  });

  describe('isHealthy', () => {
    it('should return healthy status', async () => {
      const result = await indicator.isHealthy();
      expect(mockMicroserviceIndicator.pingCheck).toHaveBeenCalled();
      expect(result).toEqual({ rmq_test: { status: 'up' } });
    });
  });
});
