import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from '../service/health.service';
import { HealthCheckResult } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn().mockResolvedValue({ status: 'ok' } as HealthCheckResult),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result', async () => {
      const result = await controller.check();
      expect(result).toBeDefined();
      expect((result as { status: string }).status).toBe('ok');
    });

    it('should call healthService.check', async () => {
      await controller.check();
      expect(healthService.check).toHaveBeenCalled();
    });
  });
});
