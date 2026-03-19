# @miinded/nestjs-prometheus

[![npm version](https://badge.fury.io/js/@miinded%2Fnestjs-prometheus.svg)](https://badge.fury.io/js/@miinded%2Fnestjs-prometheus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Production-ready NestJS module for Prometheus metrics and health checks with Terminus integration. Automatically exposes `/metrics` and `/health` endpoints with built-in health indicators for HTTP, Redis, RabbitMQ, Database, and TypeORM queries.

## Features

- 📊 **Prometheus Metrics** — Automatic `/metrics` endpoint via `prom-client`
- 🏥 **Health Checks** — `/health` endpoint powered by `@nestjs/terminus`
- 🔌 **Built-in Indicators** — HTTP, Redis, RabbitMQ, Database, TypeORM query
- 📈 **Custom Histograms & Gauges** — Register your own Prometheus metrics
- 🌍 **Global Module** — Register once, indicators available everywhere
- 📝 **Full TypeScript** — Complete type definitions for excellent DX
- ✅ **Well Tested** — Unit tests with 99%+ coverage

## Installation

```bash
npm install @miinded/nestjs-prometheus
# or
pnpm add @miinded/nestjs-prometheus
# or
yarn add @miinded/nestjs-prometheus
```

## Quick Start

### With HTTP and Database health indicators

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  PrometheusModule,
  AppHealthIndicator,
  DatabaseHealthIndicator,
  PrometheusService,
} from '@miinded/nestjs-prometheus';
import { HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrometheusModule.registerAsync({
      name: 'my-app',
      imports: [ConfigModule],
      inject: [ConfigService, HttpHealthIndicator, TypeOrmHealthIndicator],
      useFactory: (
        config: ConfigService,
        http: HttpHealthIndicator,
        db: TypeOrmHealthIndicator,
        prometheus: PrometheusService,
      ) => [
        new AppHealthIndicator(prometheus, http, {
          url: config.get('APP_URL', 'http://localhost:3000'),
        }),
        new DatabaseHealthIndicator(prometheus, db),
      ],
    }),
  ],
})
export class AppModule {}
```

This automatically registers:

- `GET /health` — Health check endpoint
- `GET /metrics` — Prometheus metrics endpoint

### Without health indicators

```typescript
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@miinded/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.registerAsync({
      name: 'my-app',
      useFactory: () => [],
    }),
  ],
})
export class AppModule {}
```

## Usage Example

```typescript
import { Injectable } from '@nestjs/common';
import { PrometheusService } from '@miinded/nestjs-prometheus';

@Injectable()
export class OrderService {
  private readonly orderHistogram;

  constructor(private readonly prometheus: PrometheusService) {
    this.orderHistogram = prometheus.registerMetrics(
      'order_processing_duration_seconds',
      'Duration of order processing in seconds',
      ['status'],
      [0.05, 0.1, 0.5, 1, 2, 5],
    );
  }

  async processOrder(id: string) {
    const end = this.orderHistogram.startTimer();
    try {
      // ... process order
      end({ status: 'success' });
    } catch (e) {
      end({ status: 'error' });
      throw e;
    }
  }
}
```

## Built-in Health Indicators

| Indicator                     | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| `AppHealthIndicator`          | HTTP ping check on the application itself              |
| `CustomHttpHealthIndicator`   | HTTP ping check on any configurable URL                |
| `DatabaseHealthIndicator`     | TypeORM database connectivity check                    |
| `RedisHealthIndicator`        | Redis connectivity check via microservice transport    |
| `RmqHealthIndicator`          | RabbitMQ connectivity check via microservice transport |
| `TypeormQueryHealthIndicator` | Custom TypeORM query health check                      |

## API Reference

### `PrometheusModule.registerAsync(options)`

| Option       | Type                              | Required | Description                                       |
| ------------ | --------------------------------- | -------- | ------------------------------------------------- |
| `name`       | `string`                          | ✅       | Application name used as Prometheus metric prefix |
| `useFactory` | `(...args) => IHealthIndicator[]` | ✅       | Factory returning health indicator instances      |
| `inject`     | `any[]`                           | ❌       | Dependencies to inject into factory               |
| `imports`    | `Module[]`                        | ❌       | Modules to import                                 |

### `PrometheusService`

| Method               | Signature                                        | Description                       |
| -------------------- | ------------------------------------------------ | --------------------------------- |
| `registerMetrics`    | `(name, help, labelNames, buckets) => Histogram` | Register a histogram metric       |
| `registerGauge`      | `(name, help) => Gauge`                          | Register a gauge metric           |
| `removeSingleMetric` | `(name) => void`                                 | Remove a single metric by name    |
| `clearMetrics`       | `() => void`                                     | Clear all registered metrics      |
| `metrics`            | `() => Promise<string>`                          | Get Prometheus text format output |

### Exports

| Symbol                        | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `PrometheusModule`            | Main module                                  |
| `PrometheusService`           | Service for registering and managing metrics |
| `AbstractBaseHealthIndicator` | Base class for custom health indicators      |
| `AppHealthIndicator`          | HTTP self-ping health indicator              |
| `CustomHttpHealthIndicator`   | Configurable HTTP health indicator           |
| `DatabaseHealthIndicator`     | TypeORM health indicator                     |
| `RedisHealthIndicator`        | Redis health indicator                       |
| `RmqHealthIndicator`          | RabbitMQ health indicator                    |
| `TypeormQueryHealthIndicator` | TypeORM query health indicator               |
| `PROMETHEUS_MODULE_OPTIONS`   | Injection token for module options           |

## License

MIT © [Miinded](https://github.com/miinded)
