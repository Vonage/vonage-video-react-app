# @vonage/video-common

Shared utilities for Vonage Video API related projects.

This package centralizes reusable code used across video applications, including async execution helpers, runtime assertions, application errors, logging utilities, Zod schemas, shared TypeScript definitions, constants, React hooks, browser helpers, browser components, platform detection utilities, Node.js schemas, and test helpers.

It is organized into three layers:

- **Universal**: runtime-agnostic utilities that can be used in any JavaScript runtime.
- **Web**: browser and React-specific utilities.
- **Node**: Node.js-specific schemas and types.

Each platform layer re-exports the universal layer, so importing from `@vonage/video-common/web` or `@vonage/video-common/node` also gives access to the universal exports.

## Install

```sh
yarn add @vonage/video-common
```

## Entry points

Import only what you need. The package supports aggregated imports, domain-level imports, and direct deep imports for individual utilities.

### Aggregated imports

| Path | Description |
|---|---|
| `@vonage/video-common` | Universal utilities |
| `@vonage/video-common/web` | Universal utilities plus browser and React utilities |
| `@vonage/video-common/node` | Universal utilities plus Node.js utilities |

### Domain imports

| Path | Description | Docs |
|---|---|---|
| `@vonage/video-common/execution` | Async control flow utilities: `tryCatch`, `debounce`, `throttle`, `defer`, `enqueue` | [universal.md](./docs/universal.md#execution) |
| `@vonage/video-common/assertions` | Type guards and runtime assertions | [universal.md](./docs/universal.md#assertions) |
| `@vonage/video-common/errors` | `ApplicationError` and error helpers | [universal.md](./docs/universal.md#errors) |
| `@vonage/video-common/logger` | Logger utilities using a provider pattern | [universal.md](./docs/universal.md#logger) |
| `@vonage/video-common/helpers` | Decode, transform, and validation helpers | [universal.md](./docs/universal.md#helpers) |
| `@vonage/video-common/schemas` | Shared Zod validation schemas | [universal.md](./docs/universal.md#schemas) |
| `@vonage/video-common/types` | Shared TypeScript types | [universal.md](./docs/universal.md#types) |
| `@vonage/video-common/constants` | Shared constants and static lookup values | [universal.md](./docs/universal.md#constants) |
| `@vonage/video-common/web/hooks` | React hooks | [web.md](./docs/web.md#hooks) |
| `@vonage/video-common/web/components` | Shared React components | [web.md](./docs/web.md#components) |
| `@vonage/video-common/web/platform` | Browser and platform detection helpers: `isMobile`, `isFirefox`, `isWebKit` | [web.md](./docs/web.md#platform) |
| `@vonage/video-common/web/helpers` | Browser helpers | [web.md](./docs/web.md#helpers) |
| `@vonage/video-common/web/schemas` | Browser-specific schemas, including `MediaDeviceInfo` and `DeviceKind` schemas | [web.md](./docs/web.md#schemas) |
| `@vonage/video-common/node/schemas` | Node specific schemas for archives, sessions, transcriptions, and related server-side workflows | [node.md](./docs/node.md#schemas) |

### Deep imports

Use deep imports when you only need a single utility:

```ts
import tryCatch from '@vonage/video-common/execution/tryCatch';
import isNil from '@vonage/video-common/assertions/isNil';
import useStableCallback from '@vonage/video-common/web/hooks/useStableCallback';
import isMobile from '@vonage/video-common/web/platform/isMobile';
```

## Test utilities

Test utilities are intended for test environments only. Do not import them from production code.

| Path | Description | Docs |
|---|---|---|
| `@vonage/video-common/test` | Universal test helpers and fixtures | [universal.test.md](./docs/universal.test.md) |
| `@vonage/video-common/web/test` | Browser test environment helpers, render utilities, and mocks | [web.test.md](./docs/web.test.md) |
| `@vonage/video-common/node/test` | Node.js module mock helpers | [node.test.md](./docs/node.test.md) |

## Quick start

```ts
import { tryCatch, debounce } from '@vonage/video-common/execution';
import { isNil, assertNotNil } from '@vonage/video-common/assertions';
import { ApplicationError } from '@vonage/video-common/errors';
import { Logger } from '@vonage/video-common/logger';

// Browser
import { useStableCallback, useStableRef } from '@vonage/video-common/web/hooks';
import { isMobile } from '@vonage/video-common/web/platform';

// Node.js
import { ArchiveOptionsSchema, SessionIdSchema } from '@vonage/video-common/node/schemas';
```

## API documentation

- **[Common](./docs/universal.md)** — execution, assertions, errors, logger, helpers, schemas, types, and constants.
- **[Web](./docs/web.md)** — React hooks, components, platform helpers, browser helpers, schemas, and types.
- **[Node.js](./docs/node.md)** — Node.js schemas and types.
- **[Universal Tests](./docs/universal.test.md)** — shared test environment, fixtures, and helpers.
- **[Web Tests](./docs/web.test.md)** — frontend test environment, render helpers, and mocks.
- **[Node Tests](./docs/node.test.md)** — Node.js module mock helpers.

## License

MIT
