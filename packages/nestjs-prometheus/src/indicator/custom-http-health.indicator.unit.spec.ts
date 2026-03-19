import { PrometheusService } from '../service/prometheus.service';
import { CustomHttpHealthIndicator, HttpOptionUrl } from './custom-http-health.indicator';
import { HttpHealthIndicator } from '@nestjs/terminus';

describe('CustomHttpHealthIndicator', () => {
  let indicator: CustomHttpHealthIndicator;
  let mockPrometheusService: jest.Mocked<PrometheusService>;
  let mockHttpIndicator: jest.Mocked<HttpHealthIndicator>;
  const options: HttpOptionUrl = { url: 'http://test-service:8080/health' };

  beforeEach(() => {
    mockPrometheusService = {
      registerMetrics: jest.fn().mockReturnValue({
        startTimer: jest.fn().mockReturnValue(jest.fn()),
      }),
      registerGauge: jest.fn().mockReturnValue({
        set: jest.fn(),
      }),
    } as any;

    mockHttpIndicator = {
      pingCheck: jest.fn().mockResolvedValue({ http_test: { status: 'up' } }),
    } as any;

    indicator = new CustomHttpHealthIndicator(mockPrometheusService, mockHttpIndicator, 'test', options);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should have correct name with prefix', () => {
    expect(indicator.name).toBe('http_test');
  });

  describe('isHealthy', () => {
    it('should return healthy status', async () => {
      const result = await indicator.isHealthy();
      expect(mockHttpIndicator.pingCheck).toHaveBeenCalledWith('http_test', 'http://test-service:8080/health', options);
      expect(result).toEqual({ http_test: { status: 'up' } });
    });
  });
});
