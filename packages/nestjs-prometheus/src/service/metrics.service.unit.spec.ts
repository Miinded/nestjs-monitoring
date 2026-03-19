import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { PrometheusService } from './prometheus.service';
import { HealthService } from './health.service';

describe('MetricsService', () => {
  let service: MetricsService;
  let healthService: HealthService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: PrometheusService,
          useValue: {
            metrics: Promise.resolve('# HELP test_metric Test metric\n# TYPE test_metric gauge\n'),
          },
        },
        {
          provide: HealthService,
          useValue: {
            checkForMetrics: jest.fn().mockResolvedValue({ status: 'ok' }),
          },
        },
        MetricsService,
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    healthService = module.get<HealthService>(HealthService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('metrics', () => {
    it('should return metrics from prometheus service', async () => {
      const metrics = await service.metrics;
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('string');
    });

    it('should call healthService.checkForMetrics', async () => {
      await service.metrics;
      expect(healthService.checkForMetrics).toHaveBeenCalled();
    });
  });
});
