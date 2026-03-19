import { PrometheusService } from '../service/prometheus.service';
import { RedisHealthIndicator, RedisConfig } from './redis-health.indicator';
import { MicroserviceHealthIndicator } from '@nestjs/terminus';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;
  let mockPrometheusService: jest.Mocked<PrometheusService>;
  let mockMicroserviceIndicator: jest.Mocked<MicroserviceHealthIndicator>;
  const redisConfig: RedisConfig = { host: 'localhost', port: 6379 };

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
      pingCheck: jest.fn().mockResolvedValue({ redis_test: { status: 'up' } }),
    } as any;

    indicator = new RedisHealthIndicator(mockPrometheusService, mockMicroserviceIndicator, 'test', redisConfig);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should have correct name with prefix', () => {
    expect(indicator.name).toBe('redis_test');
  });

  describe('isHealthy', () => {
    it('should return healthy status', async () => {
      const result = await indicator.isHealthy();
      expect(mockMicroserviceIndicator.pingCheck).toHaveBeenCalled();
      expect(result).toEqual({ redis_test: { status: 'up' } });
    });
  });
});
