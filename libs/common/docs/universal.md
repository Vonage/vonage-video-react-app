# Common API

Common utilities exported from `@vonage/video-common`.

These APIs are runtime-agnostic and can be used from browser, Node.js, and shared code.

Use the root entry when importing multiple common utilities:

```ts
import { tryCatch, isNil, ApplicationError } from '@vonage/video-common';
```

Use domain or deep imports when you want a more explicit dependency boundary:

```ts
import { tryCatch } from '@vonage/video-common/execution';
import tryCatch from '@vonage/video-common/execution/tryCatch';
```

---

## Execution

Async control-flow helpers.

```ts
import {
  tryCatch,
  debounce,
  throttle,
  defer,
  enqueue,
  attempt,
  wait,
} from '@vonage/video-common/execution';
```

### `tryCatch`

Linear `try/catch` wrapper for sync and async callbacks.

Returns:

```ts
{
  result,
  error,
  didFail,
}
```

Use it when you want explicit error handling without wrapping the call site in `try/catch`.

```ts
import tryCatch from '@vonage/video-common/execution/tryCatch';

// Async
const { result, error } = await tryCatch(() => fetchUser(userId));

if (error) return fallback;

// Sync
const { result: parsed, error } = tryCatch(() => JSON.parse(raw));

// With fallback value
const { result: config, error } = tryCatch(() => loadConfig(), defaultConfig);
```

---

### `attempt`

Fire-and-forget execution helper.

It runs a callback, catches any thrown error, and never rethrows. An optional error handler can be provided when needed.

```ts
import attempt from '@vonage/video-common/execution/attempt';

// sync
attempt(() => analytics.track('page_view'));

// async
await attempt(() => analytics.getStats('page_view'));

attempt(
  () => saveToLocalStorage(data),
  (error) => logger.reportError(error)
);
```

---

### `assertResult`

Ensures that any exception thrown by the callback is converted into a safe {@link ApplicationError} with a user-facing fallback message — preventing raw errors from leaking sensitive details (stack traces, internal state, credentials) to consumers or end users.

```ts
import assertResult from '@vonage/video-common/execution/assertResult';

const session = await assertResult(() => videoClient.createSession(), {
  fallbackConfig: {
    fallbackMessage: 'Failed to create video session', // required
    statusCode: StatusCode; // required
  }
});
```

---

### `debounce`

Delays execution until no calls have been made for the configured duration.

Useful for search inputs, resize handlers, and other high-frequency events.

```ts
import debounce from '@vonage/video-common/execution/debounce';

const search = debounce((query: string) => {
  fetchResults(query);
}, 300);

input.addEventListener('input', (event) => {
  search(event.target.value);
});
```

---

### `throttle`

Limits execution to at most once per interval.

Supports `leading` and `trailing` execution.

```ts
import throttle from '@vonage/video-common/execution/throttle';

const onScroll = throttle(
  () => {
    updateScrollPosition();
  },
  100,
  {
    leading: true,
    trailing: true,
  }
);

window.addEventListener('scroll', onScroll);
```

---

### `defer`

Creates a promise with external `resolve` and `reject` handlers.

Useful when a promise must be completed from another callback, event, or lifecycle boundary.

```ts
import defer from '@vonage/video-common/execution/defer';

const { promise, resolve, reject } = defer<string>();

someEmitter.on('done', (value) => {
  resolve(value);
});

const result = await promise;
```

---

### `enqueue`

Sequential promise queue.

Each task waits for the previous task to settle before running.

```ts
import enqueue from '@vonage/video-common/execution/enqueue';

let saveQueue: Promise<void> | null = null;

const saveDraft = (draft: Draft) => {
  saveQueue = enqueue(saveQueue, () => api.saveDraft(draft));
};
```

---

### `wait`

Simple delay helper.

```ts
import wait from '@vonage/video-common/execution/wait';

await wait(1000);
```

---
### `idempotentCallbackWithRetry`

Runs an async callback with automatic retries, but allows it to succeed only once.

After the first successful execution, future calls are no-ops.

```ts
import idempotentCallbackWithRetry from '@vonage/video-common/execution/idempotentCallbackWithRetry';

const connectOnce = await idempotentCallbackWithRetry(async () => {
  return session.connect(token);
});

await connectOnce(); // retries automatically if connection fails
```

---

## Assertions

Type guards and runtime assertions.

Guards return `boolean`. Assertions throw when the value does not satisfy the expected condition.

```ts
import {
  isNil,
  assertNotNil,
  isString,
  isRecord,
} from '@vonage/video-common/assertions';
```

### Type guards

| Export | Returns `true` when |
|---|---|
| `isNil(value)` | `value` is `null` or `undefined` |
| `isNotNil(value)` | `value` is neither `null` nor `undefined` |
| `isUndefined(value)` | `value` is `undefined` |
| `isString(value)` | `value` is a string |
| `isNumber(value)` | `value` is a number |
| `isObject(value)` | `value` is a non-null object |
| `isRecord(value)` | `value` is a plain record |
| `isFunction(value)` | `value` is a function |
| `isPromise(value)` | `value` is a thenable |
| `isEmptyString(value)` | `value` is an empty string |
| `isNumericString(value)` | `value` is a string representing a number |
| `isErrorLike(value)` | `value` has error-like properties |
| `isSessionIdLike(value)` | `value` looks like a Vonage session ID |
| `isSessionKeyLike(value)` | `value` looks like a Vonage session key |
| `isValidRoomName(value)` | `value` is a valid room name |
| `isValidSessionId(value)` | `value` is a structurally valid session ID |
| `isValidSessionKey(value)` | `value` is a structurally valid session key |

```ts
import isNil from '@vonage/video-common/assertions/isNil';

if (isNil(user)) {
  return redirectToLogin();
}
```

---

### Runtime assertions

Use assertions for fail-fast validation and type narrowing.

| Export | Throws when |
|---|---|
| `assertNotNil(value, message?)` | `value` is `null` or `undefined` |
| `assertNotEmptyString(value, message?)` | `value` is not a non-empty string |
| `assertString(value, message?)` | `value` is not a string |
| `assertNumericString(value, message?)` | `value` is not a numeric string |
| `assertRecord(value, message?)` | `value` is not a plain record |
| `assertSessionId(value, message?)` | `value` is not a valid session ID |

```ts
import assertNotNil from '@vonage/video-common/assertions/assertNotNil';

assertNotNil(session, 'Session must be initialized before connecting');

// session is now narrowed to non-null
session.connect(token);
```

---

## Errors

Structured error handling with `ApplicationError`.

```ts
import { ApplicationError } from '@vonage/video-common/errors';
```

### `ApplicationError`

Application-level error class with support for status codes, severity, issue aggregation, fallback messages, and safe serialization.

```ts
import { ApplicationError } from '@vonage/video-common/errors';
import { StatusCode } from 'status-code-enum';

const error = new ApplicationError({
  src: caughtError,
  fallbackConfig: {
    fallbackMessage: 'Unable to join the session',
    statusCode: StatusCode.ClientErrorForbidden
  },
});

error.add('Room name is required');
error.add('Token expired at {time}', { time: expirationDate });

error.assert();

// by default only includes src content if process.env.NODE_ENV === 'development'
// otherwise fallback message is the one exported
const payload = error.exportSafely();
```

| Property | Description |
|---|---|
| `issues` | Collected validation or domain issues |
| `severity` | Error severity |
| `statusCode` | HTTP-like status code |
| `fallbackMessage` | Safe fallback message |
| `type` | Error type/category |

| Method | Description |
|---|---|
| `add(message, map?)` | Adds an issue |
| `assert()` | Throws if issues exist |
| `setStatusCode(code)` | Updates the status code |
| `exportSafely()` | Serializes the error without leaking unsafe internals |

---

## Logger

Provider-based logger with deferred setup, persistent context, error reporting, and grouped logging.

```ts
import Logger from '@vonage/video-common/logger';
```

### `Logger`

```ts
import Logger from '@vonage/video-common/logger';

const logger = new Logger();

logger.setup(() => loggerProvider);

logger.log('session_connected', { sessionId });

logger.reportError(error, { context: 'publish' });

logger.setContext({ userId, sessionId });

const group = logger.group('archiveFlow', { archiveId });

group.log('started');
group.reportError(error);
```

### React bootstrap example

```ts
import Logger from '@vonage/video-common/logger';

const logger = new Logger();

logger.setup(() => myLoggerProvider);

ReactDOM.createRoot(rootElement, {
  onUncaughtError: (error) => logger.reportError(error),
  onRecoverableError: (error) => logger.reportError(error),
}).render(<App />);
```

### `LoggerProviderConfig`

```ts
import type { LoggerProviderConfig } from '@vonage/video-common/logger';

const myProvider: LoggerProviderConfig = {
  verbose: true,

  log(event, extra) {
    // send to analytics
  },

  reportError(error, extra) {
    // send to error tracker
  },
};
```

---

## Helpers

Decode, transform, and validation helpers.

```ts
import {
  decodeJwt,
  interceptObject,
  isZodError,
} from '@vonage/video-common/helpers';
```

| Export | Description |
|---|---|
| `decodeJwt(token)` | Decodes a JWT payload without verifying the signature |
| `decodeSessionId(sessionId)` | Extracts metadata from a Vonage session ID |
| `decodeSessionKey(sessionKey)` | Extracts metadata from a Vonage session key |
| `interceptObject(target, interceptors)` | Wraps and object to facilitate overrides and patches
| `isZodError(error)` | Type guard for Zod errors |
| `kebabToCamel(value)` | Converts kebab-case to camelCase |
| `removeUndefinedProps(value)` | Shallow-copies an object and removes `undefined` values |
| `toRemValue(px)` | Converts a pixel value to `rem` |

```ts
import decodeJwt from '@vonage/video-common/helpers/decodeJwt';

const payload = decodeJwt(token);

console.log(payload.exp);
```

---

## Schemas

Zod validation schemas for shared Video API values.

```ts
import {
  RoomNameSchema,
  FacingModeSchema,
} from '@vonage/video-common/schemas';
```

| Export | Validates |
|---|---|
| `RoomNameSchema` | Room name strings |
| `FacingModeSchema` | Camera facing mode |
| `ResolutionSchema` | Video resolution |
| `LangSchema` | Supported language codes |
| `VonageDeviceSchema` | Vonage device descriptor |
| `VonageDeviceKindSchema` | Vonage device kind |
| `VonageAudioOutputDeviceSchema` | Audio output device descriptor |
| `ClientLogEventSchema` | Client log event payload |

```ts
import { RoomNameSchema } from '@vonage/video-common/schemas';

const result = RoomNameSchema.safeParse(input);

if (!result.success) {
  showError(result.error);
}
```

---

## Types

Shared TypeScript types.

Most exports are type-only and have no runtime cost.

```ts
import type {
  SessionId,
  VideoSessionDetails,
  DeepPartial,
} from '@vonage/video-common/types';
```

| Export | Description |
|---|---|
| `Any` | Explicit escape hatch type |
| `AnyFunction` | Generic function type |
| `DecodedSessionId` | Shape returned by `decodeSessionId` |
| `DeepPartial<T>` | Recursive `Partial<T>` |
| `FacingMode` | Camera facing mode |
| `IsOptionalKey<T, K>` | Checks whether key `K` is optional in `T` |
| `KebabToCamel<S>` | String type transform from kebab-case to camelCase |
| `Mockable<T>` | Makes methods mockable for test utilities |
| `ObjectKeys<T>` | Typed `Object.keys` result |
| `Prettify<T>` | Flattens intersection types for IntelliSense |
| `SameKeys<A, B>` | Compile-time key compatibility helper |
| `SessionId` | Branded session ID type |
| `SessionKey` | Branded session key type |
| `SessionKeyPayload` | Decoded session key payload |
| `VideoSessionDetails` | Video session configuration |
| `VideoSessionDetailsWithToken` | Video session configuration plus token |

### Runtime exports

Some type-domain exports also exist at runtime.

| Export | Description |
|---|---|
| `Resolution` | Resolution enum/value from schemas |
| `Lang` | Language enum/value from schemas |
| `ClientLogEventSchema` | Zod schema for client log events |

---

## Constants

Static camera-label lookup values.

```ts
import {
  frontFacingKeywords,
  rearFacingKeywords,
} from '@vonage/video-common/constants';
```

| Export | Description |
|---|---|
| `frontFacingKeywords` | Labels commonly used for front-facing cameras |
| `rearFacingKeywords` | Labels commonly used for rear-facing cameras |

```ts
import frontFacingKeywords from '@vonage/video-common/constants/frontFacingKeywords';

const isFrontCamera = frontFacingKeywords.some((keyword) =>
  deviceLabel.includes(keyword)
);
```
