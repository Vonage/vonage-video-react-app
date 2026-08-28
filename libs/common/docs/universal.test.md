# Universal Test Utilities

Exports available from `@vonage/video-common/test`. For use in test environments only.

---

## environment

Test environment setup hooks.

```ts
import { setupCancelablePromiseHook, cancelablePromiseTracker } from '@vonage/video-common/test';
```

### setupCancelablePromiseHook

Patches `CancelablePromise.prototype.cancel` to track cancelled promises during tests. Requires `easy-cancelable-promise` as an optional dependency — if the package is not installed, the hook is a no-op (no crash).

```ts
import { setupCancelablePromiseHook } from '@vonage/video-common/test';

beforeAll(() => {
  setupCancelablePromiseHook();
});
```

### cancelablePromiseTracker

A Vitest mock function (`vi.fn()`) that records every `CancelablePromise` instance that was cancelled during the test run. Use it to assert that cleanup happened.

```ts
import { cancelablePromiseTracker } from '@vonage/video-common/test';

afterEach(() => {
  expect(cancelablePromiseTracker).toHaveBeenCalled();
  cancelablePromiseTracker.mockClear();
});
```

---

## fixtures

Shared test data.

```ts
import { VALID_SESSION_ID, INVALID_SESSION_IDS, makeArchive } from '@vonage/video-common/test';
```

| Export | Description |
|---|---|
| `VALID_SESSION_ID` | A structurally valid session ID string for testing |
| `INVALID_SESSION_IDS` | Array of invalid session ID strings |
| `makeArchive(overrides?)` | Factory that creates a mock `SingleArchiveResponse` object |

```ts
import { VALID_SESSION_ID, makeArchive } from '@vonage/video-common/test';

const archive = makeArchive({ status: 'started', sessionId: VALID_SESSION_ID });
```

---

## helpers

Utilities for creating mocks and partial module overrides.

```ts
import { makeGenericMock, setupPartialMock, mockModule } from '@vonage/video-common/test';
```

### makeGenericMock

Creates a generic mock object where all methods are `vi.fn()`.

### setupPartialMock

Applies partial mock overrides to an object instance — each key replaces the corresponding method or property.

### mockModule

Merges a real module with partial mock overrides. Used inside `vi.mock()` factory functions.

```ts
import { mockModule } from '@vonage/video-common/test';

vi.mock('@vonage/video', async () => {
  const actual = await vi.importActual('@vonage/video');
  return mockModule(actual, {
    createSession: vi.fn().mockResolvedValue({ sessionId: 'mock-id' }),
  });
});
```
