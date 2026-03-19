# @miinded/nestjs-monitoring

A collection of production-ready NestJS monitoring modules with Prometheus and health check integration.

<p align="center">
  <a href="https://github.com/miinded/nestjs-monitoring/actions/workflows/quality.yml"><img src="https://github.com/miinded/nestjs-monitoring/actions/workflows/quality.yml/badge.svg?branch=main" alt="CI" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@miinded/nestjs-prometheus"><img src="https://img.shields.io/npm/v/@miinded/nestjs-prometheus.svg?label=nestjs-prometheus" alt="npm nestjs-prometheus" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js >= 22" />
  <img src="https://img.shields.io/badge/NestJS-10.x%20%7C%2011.x-ea2845" alt="NestJS 10.x | 11.x" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6" alt="TypeScript 5.x" />
  <img src="https://img.shields.io/badge/pnpm-monorepo-f69220" alt="pnpm monorepo" />
</p>

## Compatibility

| Dependency | Supported versions |
| ---------- | ------------------ |
| Node.js    | `>= 22`            |
| NestJS     | `10.x` · `11.x`    |
| TypeScript | `5.x`              |
| RxJS       | `7.x`              |

## Packages

| Package | Description |
| ------- | ----------- |
| [`@miinded/nestjs-prometheus`](./packages/nestjs-prometheus) | Prometheus metrics exposure and health checks with Terminus integration |

## Installation

```bash
npm install @miinded/nestjs-prometheus
pnpm add @miinded/nestjs-prometheus
```

## Features

- **Prometheus metrics** — Expose `/metrics` endpoint powered by `prom-client`
- **Health checks** — Built-in health indicators for HTTP, Database, Redis, RabbitMQ
- **Terminus integration** — Works with `@nestjs/terminus` out of the box
- **Custom indicators** — Extend `AbstractBaseHealthIndicator` for your own checks
- **Async configuration** — `registerAsync` with factory injection and `ConfigService` support
- **Global module** — Registers as global by default
- **TypeScript first** — Full type definitions with exported interfaces
- **Dual CJS/ESM** — Both CommonJS and ES module builds included

---

## Prometheus Module

### Register the module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrometheusModule } from '@miinded/nestjs-prometheus';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrometheusModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        name: config.getOrThrow('APP_NAME'),
      }),
    }),
  ],
})
export class AppModule {}
```

This automatically registers:
- `GET /metrics` — Prometheus metrics endpoint

### Built-in health indicators

```typescript
import { Injectable } from '@nestjs/common';
import {
  AppHealthIndicator,
  DatabaseHealthIndicator,
  RedisHealthIndicator,
  RmqHealthIndicator,
} from '@miinded/nestjs-prometheus';
```

| Indicator | Description |
| --------- | ----------- |
| `AppHealthIndicator` | HTTP ping check against a configured URL |
| `DatabaseHealthIndicator` | TypeORM database connectivity check |
| `RedisHealthIndicator` | Redis connectivity via microservice transport |
| `RmqHealthIndicator` | RabbitMQ connectivity via microservice transport |
| `TypeormQueryHealthIndicator` | Custom TypeORM query health check |
| `CustomHttpHealthIndicator` | Configurable HTTP endpoint health check |

### Custom health indicator

```typescript
import { Injectable } from '@nestjs/common';
import { AbstractBaseHealthIndicator } from '@miinded/nestjs-prometheus';

@Injectable()
export class MyServiceHealthIndicator extends AbstractBaseHealthIndicator {
  readonly name = 'my-service';

  async checkHealth(): Promise<boolean> {
    const response = await fetch('https://my-service/health');
    return response.ok;
  }
}
```

### Inject the metrics service

```typescript
import { Injectable } from '@nestjs/common';
import { PrometheusService } from '@miinded/nestjs-prometheus';

@Injectable()
export class AppService {
  constructor(private readonly prometheus: PrometheusService) {}

  registerCounter(name: string, help: string) {
    return this.prometheus.counter({ name, help });
  }
}
```

---

## API Reference

### `PrometheusModule.registerAsync(options)`

| Option | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `useFactory` | `(...args) => PrometheusConfig` | ❌ | Factory returning Prometheus config |
| `inject` | `any[]` | ❌ | Dependencies to inject into factory |
| `imports` | `Module[]` | ❌ | Modules to import |

### `PrometheusConfig`

| Option | Type | Description |
| ------ | ---- | ----------- |
| `name` | `string` | Application name used as metric label |

### Exports

| Symbol | Description |
| ------ | ----------- |
| `PrometheusModule` | Main module |
| `PrometheusService` | Service for registering and clearing metrics |
| `AbstractBaseHealthIndicator` | Base class for custom health indicators |
| `AppHealthIndicator` | HTTP ping health indicator |
| `DatabaseHealthIndicator` | TypeORM health indicator |
| `RedisHealthIndicator` | Redis health indicator |
| `RmqHealthIndicator` | RabbitMQ health indicator |
| `TypeormQueryHealthIndicator` | Custom TypeORM query health indicator |
| `CustomHttpHealthIndicator` | Configurable HTTP health indicator |
| `PROMETHEUS_MODULE_OPTIONS` | Injection token |

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test:unit        # Run unit tests
pnpm test:coverage    # Run tests with coverage report
pnpm lint             # Lint all packages
pnpm format:check     # Check formatting
pnpm barrels:check    # Verify barrel file exports
pnpm ci:quality       # Run full CI quality pipeline locally
```

### Test conventions

| Type        | Pattern          | Command          |
| ----------- | ---------------- | ---------------- |
| Unit        | `*.unit.spec.ts` | `pnpm test:unit` |
| Integration | `*.int.spec.ts`  | `pnpm test:int`  |
| E2E         | `*.e2e.spec.ts`  | `pnpm test:e2e`  |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, …)
4. Add or update tests for your changes
5. Run `pnpm ci:quality` to validate locally
6. Open a pull request against `main`

## Changelog

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation. See the release history in each package:

- [`@miinded/nestjs-prometheus` changelog](./packages/nestjs-prometheus/CHANGELOG.md)

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/miinded">Miinded</a>
</p>
