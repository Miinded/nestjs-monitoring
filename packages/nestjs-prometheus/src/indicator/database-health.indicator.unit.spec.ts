import { PrometheusService } from '../service/prometheus.service';
import { DatabaseHealthIndicator } from './database-health.indicator';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';

describe('DatabaseHealthIndicator', () => {
  let indicator: DatabaseHealthIndicator;
  let mockPrometheusService: jest.Mocked<PrometheusService>;
  let mockDbIndicator: jest.Mocked<TypeOrmHealthIndicator>;

  beforeEach(() => {
    mockPrometheusService = {
      registerMetrics: jest.fn().mockReturnValue({
        startTimer: jest.fn().mockReturnValue(jest.fn()),
      }),
      registerGauge: jest.fn().mockReturnValue({
        set: jest.fn(),
      }),
    } as any;

    mockDbIndicator = {
      pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
    } as any;

    indicator = new DatabaseHealthIndicator(mockPrometheusService, mockDbIndicator);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should have correct name', () => {
    expect(indicator.name).toBe('database');
  });

  describe('isHealthy', () => {
    it('should return healthy status without options', async () => {
      const result = await indicator.isHealthy();
      expect(mockDbIndicator.pingCheck).toHaveBeenCalledWith('database', undefined);
      expect(result).toEqual({ database: { status: 'up' } });
    });

    it('should return healthy status with options', async () => {
      const indicatorWithOptions = new DatabaseHealthIndicator(mockPrometheusService, mockDbIndicator, {
        timeout: 1000,
      });
      await indicatorWithOptions.isHealthy();
      expect(mockDbIndicator.pingCheck).toHaveBeenCalledWith('database', { timeout: 1000 });
    });
  });
});
