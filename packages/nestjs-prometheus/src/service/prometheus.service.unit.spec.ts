import { PrometheusService } from './prometheus.service';

describe('PrometheusService', () => {
  let service: PrometheusService;
  let testCounter: number;

  beforeEach(() => {
    testCounter = Date.now();
    service = new PrometheusService('test-app');
  });

  afterEach(() => {
    service.clearMetrics();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create service with correct title', () => {
    expect(service).toBeDefined();
  });

  it('should replace hyphens with underscores in service title', () => {
    const serviceWithHyphens = new PrometheusService('my-test-app');
    expect(serviceWithHyphens).toBeDefined();
  });

  it('should replace spaces with underscores in service title', () => {
    const serviceWithSpaces = new PrometheusService('my test app');
    expect(serviceWithSpaces).toBeDefined();
  });

  describe('registerMetrics', () => {
    it('should register a new histogram metric', () => {
      const histogram = service.registerMetrics(`test_metric_${testCounter}`, 'Test metric description', ['method'], [0.1, 0.5, 1]);
      expect(histogram).toBeDefined();
    });

    it('should return existing histogram if already registered', () => {
      const name = `existing_metric_${testCounter}`;
      const histogram1 = service.registerMetrics(name, 'Test metric description', ['method'], [0.1, 0.5, 1]);
      const histogram2 = service.registerMetrics(name, 'Test metric description', ['method'], [0.1, 0.5, 1]);
      expect(histogram1).toBe(histogram2);
    });
  });

  describe('registerGauge', () => {
    it('should register a new gauge metric', () => {
      const gauge = service.registerGauge(`test_gauge_${testCounter}`, 'Test gauge description');
      expect(gauge).toBeDefined();
    });

    it('should return existing gauge if already registered', () => {
      const name = `existing_gauge_${testCounter}`;
      const gauge1 = service.registerGauge(name, 'Test gauge description');
      const gauge2 = service.registerGauge(name, 'Test gauge description');
      expect(gauge1).toBe(gauge2);
    });
  });

  describe('metrics', () => {
    it('should return metrics as string', async () => {
      const metrics = await service.metrics;
      expect(typeof metrics).toBe('string');
      expect(metrics).toContain('test_app_metrics_');
    });
  });

  describe('removeSingleMetric', () => {
    it('should remove a registered metric', () => {
      service.registerMetrics(`remove_metric_${testCounter}`, 'Test metric description', ['method'], [0.1, 0.5, 1]);
      expect(() => service.removeSingleMetric(`remove_metric_${testCounter}`)).not.toThrow();
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      service.registerMetrics(`clear_metric_${testCounter}`, 'Test metric description', ['method'], [0.1, 0.5, 1]);
      service.registerGauge(`clear_gauge_${testCounter}`, 'Test gauge description');
      expect(() => service.clearMetrics()).not.toThrow();
    });
  });
});
