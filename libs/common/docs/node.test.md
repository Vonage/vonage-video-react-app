# Node.js Test Utilities

Exports available from `@vonage/video-common/node/test`. Re-exports everything from [universal test utilities](./universal.test.md) plus Node.js-specific module mocking helpers.

---

## helpers

### mockVideoModule

Creates a mock override for `@vonage/video` to use inside `vi.mock()`. Handles the `Video` class constructor specially — lets you mock instance methods or intercept construction.

Requires `@vonage/video` as a dependency (type-only at import time, runtime when called).

```ts
import { mockVideoModule } from '@vonage/video-common/node/test';

vi.mock('@vonage/video', async () => {
  const actual = await vi.importActual('@vonage/video');

  return mockVideoModule(actual, {
    Video: {
      createSession: { sessionId: 'mock-session-id' },
      generateClientToken: 'mock-token',
    },
  });
});
```

Advanced — intercept construction:

```ts
mockVideoModule(actual, {
  Video: ({ instance, spyOn }) => {
    spyOn({
      createSession: vi.fn().mockResolvedValue({ sessionId: 'test' }),
    });
  },
});
```

---

### mockAuthModule

Creates a mock override for `@vonage/auth` to use inside `vi.mock()`. Same pattern as `mockVideoModule` but for the `Auth` class.

Requires `@vonage/auth` as an optional dependency — the module is importable even if `@vonage/auth` is not installed, but calling `mockAuthModule` will throw if the package is missing.

```ts
import { mockAuthModule } from '@vonage/video-common/node/test';

vi.mock('@vonage/auth', async () => {
  const actual = await vi.importActual('@vonage/auth');

  return mockAuthModule(actual, {
    Auth: {
      getQueryParams: { foo: 'bar' },
    },
  });
});
```

---

### waitForEvent

Waits for a specific event to be emitted from a Node.js `EventEmitter`. Resolves when the event fires.

```ts
import { waitForEvent } from '@vonage/video-common/node/test';

const emitter = new EventEmitter();

setTimeout(() => emitter.emit('ready'), 100);

await waitForEvent(emitter, 'ready');
// continues after 'ready' was emitted

// With a spy
await waitForEvent(emitter, 'data', (payload) => {
  expect(payload).toEqual({ id: 1 });
});
```
