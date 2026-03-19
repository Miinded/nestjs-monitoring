import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, HealthIndicatorResult, TerminusModule } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { IHealthIndicator } from '../interface/ihealth-indicator.interface';

class MockHealthIndicator implements IHealthIndicator {
  name = 'mock_indicator';
  callMetrics = {};
  customMetricsRegistered = false;
  customGaugesRegistered = false;
  updatePrometheusData(_isConnected: boolean): void {}
  async isHealthy(): Promise<HealthIndicatorResult> {
    return {
      [this.name]: { status: 'up' as const },
    };
  }
  reportUnhealthy(): HealthIndicatorResult {
    return {
      [this.name]: { status: 'down' as const },
    };
  }
}

class FailingHealthIndicator implements IHealthIndicator {
  name = 'failing_indicator';
  callMetrics = {};
  customMetricsRegistered = false;
  customGaugesRegistered = false;
  updatePrometheusData(_isConnected: boolean): void {}
  async isHealthy(): Promise<HealthIndicatorResult> {
    throw new Error('Health check failed');
  }
  reportUnhealthy(): HealthIndicatorResult {
    return {
      [this.name]: { status: 'down' as const },
    };
  }
}

describe('HealthService', () => {
  let service: HealthService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TerminusModule],
      providers: [
        {
          provide: 'INDICATORS',
          useValue: [new MockHealthIndicator()],
        },
        {
          provide: HealthService,
          useFactory: (health: HealthCheckService, indicators: IHealthIndicator[]) => {
            return new HealthService(health, indicators);
          },
          inject: [HealthCheckService, 'INDICATORS'],
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result', async () => {
      const result = await service.check();
      expect(result).toBeDefined();
      expect(result?.status).toBe('ok');
    });
  });

  describe('checkForMetrics', () => {
    it('should return health check result', async () => {
      const result = await service.checkForMetrics();
      expect(result).toBeDefined();
    });
  });
});

describe('HealthService with failing indicator', () => {
  let service: HealthService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TerminusModule],
      providers: [
        {
          provide: 'INDICATORS',
          useValue: [new FailingHealthIndicator()],
        },
        {
          provide: HealthService,
          useFactory: (health: HealthCheckService, indicators: IHealthIndicator[]) => {
            return new HealthService(health, indicators);
          },
          inject: [HealthCheckService, 'INDICATORS'],
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should handle failing indicators gracefully in checkForMetrics', async () => {
    await expect(service.checkForMetrics()).rejects.toThrow();
  });
});
