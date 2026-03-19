import { PrometheusService } from '../service/prometheus.service';
import { AppHealthIndicator } from './app-health.indicator';
import { HttpHealthIndicator } from '@nestjs/terminus';

describe('AppHealthIndicator', () => {
  let indicator: AppHealthIndicator;
  let mockPrometheusService: jest.Mocked<PrometheusService>;
  let mockHttpIndicator: jest.Mocked<HttpHealthIndicator>;

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
      pingCheck: jest.fn().mockResolvedValue({ app: { status: 'up' } }),
    } as any;

    indicator = new AppHealthIndicator(mockPrometheusService, mockHttpIndicator);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should have correct name', () => {
    expect(indicator.name).toBe('app');
  });

  describe('isHealthy', () => {
    it('should return healthy status with default url', async () => {
      const result = await indicator.isHealthy();
      expect(mockHttpIndicator.pingCheck).toHaveBeenCalledWith('app', 'http://localhost:5000', undefined);
      expect(result).toEqual({ app: { status: 'up' } });
    });

    it('should return healthy status with custom url', async () => {
      const indicatorWithOption = new AppHealthIndicator(mockPrometheusService, mockHttpIndicator, { url: 'http://custom:3000' });
      await indicatorWithOption.isHealthy();
      expect(mockHttpIndicator.pingCheck).toHaveBeenCalledWith('app', 'http://custom:3000', { url: 'http://custom:3000' });
    });
  });
});
