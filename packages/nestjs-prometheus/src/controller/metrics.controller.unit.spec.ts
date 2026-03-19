import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from '../service/metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: {
            metrics: Promise.resolve('# HELP test_metric Test metric\n# TYPE test_metric gauge\n'),
          },
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('metrics', () => {
    it('should return metrics', async () => {
      const result = await controller.metrics();
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
