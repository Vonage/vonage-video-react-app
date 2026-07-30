# Node.js API

All exports available from `@vonage/video-common/node`. This entry re-exports everything from the [universal layer](./universal.md) — only Node.js-specific additions are documented here.

---

## schemas

Zod schemas for Vonage Video API server-side operations. Require `zod` and `@vonage/video` as dependencies.

```ts
import { SessionIdSchema, ArchiveOptionsSchema } from '@vonage/video-common/node/schemas';
```

### Session schemas

| Export | Validates |
|---|---|
| `SessionIdSchema` | Valid Vonage session ID string |
| `SessionKeySchema` | Valid Vonage session key string |

```ts
import { SessionIdSchema } from '@vonage/video-common/node/schemas';

const sessionId = SessionIdSchema.parse(rawId); // throws if invalid
```

### Archive schemas

| Export | Validates |
|---|---|
| `LayoutTypeSchema` | Archive layout type enum |
| `ArchiveOutputModeSchema` | Output mode (`composed`, `individual`) |
| `MediaModeSchema` | Media mode (`routed`, `relayed`) |
| `ArchiveModeSchema` | Archive mode (`manual`, `always`) |
| `StreamModeSchema` | Stream mode (`auto`, `manual`) |
| `ArchiveLayoutSchema` | Full archive layout configuration |
| `TranscriptionPropertiesSchema` | Transcription configuration |
| `BaseArchiveOptionsSchema` | Base archive creation options |
| `ArchiveOptionsWithMaxBitrateSchema` | Archive options with max bitrate constraint |
| `ArchiveOptionsWithQuantizationParameterSchema` | Archive options with quantization parameter |
| `ArchiveWithTranscriptionSchema` | Archive options that include transcription |
| `ArchiveWithoutTranscriptionSchema` | Archive options without transcription |
| `ArchiveOptionsSchema` | Union of all archive option variants |

```ts
import { ArchiveOptionsSchema } from '@vonage/video-common/node/schemas';

const options = ArchiveOptionsSchema.parse(requestBody);
// options is typed as the correct variant based on the input shape
```

---

## types

Re-exports all [universal types](./universal.md#types) plus archive-related types inferred from the schemas:

| Export | Description |
|---|---|
| `TranscriptionProperties` | Transcription configuration shape |
| `BaseArchiveOptions` | Base archive creation options shape |
| `ArchiveOptionsWithMaxBitrate` | Archive options with bitrate limit |
| `ArchiveOptionsWithQuantizationParameter` | Archive options with QP constraint |
| `ArchiveWithTranscription` | Archive options including transcription config |
| `ArchiveWithoutTranscription` | Archive options without transcription |

```ts
import type { ArchiveOptionsWithMaxBitrate } from '@vonage/video-common/node/types';
```

---

## assertions

Re-exports all [universal assertions](./universal.md#assertions). No Node-specific assertions are added.

## helpers

Re-exports all [universal helpers](./universal.md#helpers). No Node-specific helpers are added.

---

## errors

Server-specific error handling. Re-exports all [universal errors](./universal.md#errors) plus Node-specific additions.

```ts
import { ApplicationServerError, makeInternalErrorHandler } from '@vonage/video-common/node/errors';
```

### ApplicationServerError

Extends `ApplicationError` with HTTP response and request metadata. Provides `retrieveErrorLogDetails()` for structured logging and `exportSafely()` for client-safe error responses.

### Error handlers

Factory functions that return error handlers wrapping errors as `ApplicationServerError` with the appropriate status code.

| Export | Status code |
|---|---|
| `makeInternalErrorHandler` | 500 |
| `makeBadRequestErrorHandler` | 400 |
| `makeUnauthorizedErrorHandler` | 401 |
| `makeNotFoundErrorHandler` | 404 |
| `makeThirdPartyErrorHandler` | 502 |
| `makeVideoApiErrorHandler` | 502 (with OpenTok error parsing) |

```ts
import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@vonage/video-common/node/errors';

const handleInternalError = makeInternalErrorHandler('Something went wrong');
const handleThirdPartyError = makeThirdPartyErrorHandler({ fallbackMessage: 'Service error', mapThirdPartyErrors: true });
```

### Server assertions

| Export | Description |
|---|---|
| `isApplicationServerError` | Type guard for `ApplicationServerError` instances |
| `isApplicationServerErrorLike` | Checks if an object has the minimum shape of an `ApplicationServerError` |
| `isHttpErrorLike` | Checks if an error has an HTTP response shape |

### Server helpers

| Export | Description |
|---|---|
| `mapServerSourceToState` | Maps an unknown error source to a partial `ApplicationErrorState` |

---

## executions

Re-exports all [universal execution utilities](./universal.md#execution). The server-specific `assertResult` shadows the base version.

```ts
import { assertResult } from '@vonage/video-common/node/executions';
```

### assertResult

Wraps a callback execution and, on failure, produces an `ApplicationServerError` with the provided fallback configuration. The server version is typed against `ApplicationServerError` rather than the base `ApplicationError`.

```ts
import { assertResult } from '@vonage/video-common/node/executions';
import { makeInternalErrorHandler } from '@vonage/video-common/node/errors';

const session = await assertResult(
  () => videoClient.createSession(),
  { fallbackConfig: { fallbackMessage: 'Failed to create session', statusCode: 500 } }
);
```



