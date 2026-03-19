import { PrometheusService } from '../service/prometheus.service';
import { TypeormQueryHealthIndicator, TypeormQueryCallback } from './typeorm-query-health.indicator';

// Mock DataSource
const mockQueryRunner = {};
const mockConnection = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  query: jest.fn().mockResolvedValue([{ count: 1 }]),
  destroy: jest.fn().mockResolvedValue(undefined),
};

jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(mockConnection),
  })),
}));

describe('TypeormQueryHealthIndicator', () => {
  let indicator: TypeormQueryHealthIndicator;
  let mockPrometheusService: jest.Mocked<PrometheusService>;
  const mockOptions = { type: 'postgres', host: 'localhost', port: 5432 } as any;
  const query = 'SELECT COUNT(*) as count FROM users';
  const parameters: any[] = [];
  const callback: TypeormQueryCallback = (results) => ({
    result: (results as any[])[0].count > 0,
    data: { count: (results as any[])[0].count },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrometheusService = {
      registerMetrics: jest.fn().mockReturnValue({
        startTimer: jest.fn().mockReturnValue(jest.fn()),
      }),
      registerGauge: jest.fn().mockReturnValue({
        set: jest.fn(),
      }),
    } as any;

    indicator = new TypeormQueryHealthIndicator(
      mockPrometheusService,
      mockOptions,
      'users',
      query,
      parameters,
      callback,
    );
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should have correct name with prefix', () => {
    expect(indicator.name).toBe('query_users');
  });

  describe('isHealthy', () => {
    it('should return healthy status when query succeeds', async () => {
      const result = await indicator.isHealthy();
      expect(result).toMatchObject({
        query_users: {
          status: 'up',
        },
      });
    });
  });
});
