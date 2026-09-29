# @vonage/video-reference-apps-common

Shared utilities for Vonage Video API related projects.

This package centralizes reusable code used across video applications, including async execution helpers, runtime assertions, application errors, logging utilities, Zod schemas, shared TypeScript definitions, constants, React hooks, browser helpers, browser components, platform detection utilities, Node.js schemas, and test helpers.

It is organized into three layers:

- **Universal**: runtime-agnostic utilities that can be used in any JavaScript runtime.
- **Web**: browser and React-specific utilities.
- **Node**: Node.js-specific schemas and types.

Each platform layer re-exports the universal layer, so importing from `@vonage/video-reference-apps-common/web` or `@vonage/video-reference-apps-common/node` also gives access to the universal exports.

## Install

```sh
yarn add @vonage/video-reference-apps-common
```

## Entry points

Import only what you need. The package supports aggregated imports, domain-level imports, and direct deep imports for individual utilities.

### Aggregated imports

| Path | Description |
|---|---|
| `@vonage/video-reference-apps-common` | Universal utilities |
| `@vonage/video-reference-apps-common/web` | Universal utilities plus browser and React utilities |
| `@vonage/video-reference-apps-common/node` | Universal utilities plus Node.js utilities |

### Domain imports

| Path | Description | Docs |
|---|---|---|
| `@vonage/video-reference-apps-common/execution` | Async control flow utilities: `tryCatch`, `debounce`, `throttle`, `defer`, `enqueue` | [universal.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.md#execution) |
| `@vonage/video-reference-apps-common/assertions` | Type guards and runtime assertions | [universal.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.md#assertions) |
| `@vonage/video-reference-apps-common/errors` | `ApplicationError` and error helpers | [universal.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.md#errors) |
| `@vonage/video-reference-apps-common/logger` | Logger utilities using a provider pattern | [universal.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.md#logger) |
| `@vonage/video-reference-apps-common/helpers` | Decode, transform, and validation helpers | [universal.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.md#helpers) |
| `@vonage/video-reference-apps-common/schemas` | Shared Zod validation schemas | [universal.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.md#schemas) |
| `@vonage/video-reference-apps-common/types` | Shared TypeScript types | [universal.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.md#types) |
| `@vonage/video-reference-apps-common/constants` | Shared constants and static lookup values | [universal.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.md#constants) |
| `@vonage/video-reference-apps-common/web/hooks` | React hooks | [web.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/web.md#hooks) |
| `@vonage/video-reference-apps-common/web/components` | Shared React components | [web.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/web.md#components) |
| `@vonage/video-reference-apps-common/web/platform` | Browser and platform detection helpers: `isMobile`, `isFirefox`, `isWebKit` | [web.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/web.md#platform) |
| `@vonage/video-reference-apps-common/web/helpers` | Browser helpers | [web.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/web.md#helpers) |
| `@vonage/video-reference-apps-common/web/schemas` | Browser-specific schemas, including `MediaDeviceInfo` and `DeviceKind` schemas | [web.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/web.md#schemas) |
| `@vonage/video-reference-apps-common/node/schemas` | Node specific schemas for archives, sessions, transcriptions, and related server-side workflows | [node.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/node.md#schemas) |
| `@vonage/video-reference-apps-common/node/errors` | Server-specific error handling: `ApplicationServerError`, error handlers (`makeInternalErrorHandler`, `makeBadRequestErrorHandler`, etc.), and server assertions | [node.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/node.md#errors) |
| `@vonage/video-reference-apps-common/node/executions` | Server-specific execution helpers: `assertResult` (wraps errors as `ApplicationServerError`) | [node.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/node.md#executions) |

### Deep imports

Use deep imports when you only need a single utility:

```ts
import tryCatch from '@vonage/video-reference-apps-common/execution/tryCatch';
import isNil from '@vonage/video-reference-apps-common/assertions/isNil';
import useStableCallback from '@vonage/video-reference-apps-common/web/hooks/useStableCallback';
import isMobile from '@vonage/video-reference-apps-common/web/platform/isMobile';
```

## Test utilities

Test utilities are intended for test environments only. Do not import them from production code.

| Path | Description | Docs |
|---|---|---|
| `@vonage/video-reference-apps-common/test` | Universal test helpers and fixtures | [universal.test.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.test.md) |
| `@vonage/video-reference-apps-common/web/test` | Browser test environment helpers, render utilities, and mocks | [web.test.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/web.test.md) |
| `@vonage/video-reference-apps-common/node/test` | Node.js module mock helpers | [node.test.md](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/node.test.md) |

## Quick start

```ts
import { tryCatch, debounce } from '@vonage/video-reference-apps-common/execution';
import { isNil, assertNotNil } from '@vonage/video-reference-apps-common/assertions';
import { ApplicationError } from '@vonage/video-reference-apps-common/errors';
import { Logger } from '@vonage/video-reference-apps-common/logger';

// Browser
import { useStableCallback, useStableRef } from '@vonage/video-reference-apps-common/web/hooks';
import { isMobile } from '@vonage/video-reference-apps-common/web/platform';

// Node.js
import { ArchiveOptionsSchema, SessionIdSchema } from '@vonage/video-reference-apps-common/node/schemas';
import { ApplicationServerError, makeInternalErrorHandler } from '@vonage/video-reference-apps-common/node/errors';
import { assertResult } from '@vonage/video-reference-apps-common/node/executions';
```

## API documentation

- **[Common](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.md)** — execution, assertions, errors, logger, helpers, schemas, types, and constants.
- **[Web](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/web.md)** — React hooks, components, platform helpers, browser helpers, schemas, and types.
- **[Node.js](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/node.md)** — Node.js schemas and types.
- **[Universal Tests](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/universal.test.md)** — shared test environment, fixtures, and helpers.
- **[Web Tests](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/web.test.md)** — frontend test environment, render helpers, and mocks.
- **[Node Tests](https://github.com/Vonage/vonage-video-react-app/blob/main/libs/common/docs/node.test.md)** — Node.js module mock helpers.

## License

MIT
