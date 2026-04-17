# Frontend Unit Testing Guide

This guide explains how to write effective **frontend unit tests** in the Vonage Video React App using real providers instead of mocks.

> **Note:** This guide is for **frontend unit tests** (React components, hooks, contexts) located in `frontend/src/**/*.spec.tsx`. 
> For **integration tests** (end-to-end Playwright tests), see `/integration-tests`.

## Table of Contents

1. [Test Utilities Directory Structure](#test-utilities-directory-structure)
2. [Testing Philosophy](#testing-philosophy)
3. [What to Mock](#what-to-mock)
4. [Available Wrappers](#available-wrappers)
5. [Setup](#setup)
6. [Best Practices](#best-practices)
7. [Examples](#examples)
8. [Additional Resources](#additional-resources)

---

## Test Utilities Directory Structure

The test utilities are located in `frontend/src/test/`:

```
frontend/src/test/
├── mocks/             # External dependency mocks (SDK, browser APIs)
│   └── vonageVideo.ts
├── providers/         # Provider wrappers and composers
│   ├── makeTestProvider.ts                    # Preferred: compose multiple providers
│   ├── makeUserProviderWrapper.ts
│   ├── makeSessionProviderWrapper.ts
│   ├── makePublisherProviderWrapper.ts
│   ├── makeAudioOutputProviderWrapper.ts
│   ├── makePreviewPublisherProviderWrapper.ts
│   ├── makeBackgroundPublisherProviderWrapper.ts
│   └── index.ts
├── globals.ts         # Global test configuration
└── setup.ts           # Test setup and teardown
```

---

## Testing Philosophy

**Use real providers with test data** - Test components with actual context providers to validate real behavior.

```tsx
// ✅ GOOD: Real provider with initialValue
render(<MyComponent />, {
  publisherContext: {
    initialValue: {
      isPublishing: true,
      isVideoEnabled: true,
    },
  },
  sessionContext: {
    initialValue: {
      connected: true,
    },
  },
});
```

```tsx
// ❌ BAD: Mocking application context
vi.mock('@hooks/useUserContext');
```

## What to Mock

| Mock | Don't Mock |
|------|------------|
| External SDKs (`@vonage/client-sdk-video`) | Application contexts |
| Browser APIs (`navigator.mediaDevices`) | Custom hooks |
| | Components |


## Available Wrappers

Use `makeTestProvider` with the `providers` enum to compose exactly the providers your test needs:

| Provider key | Wraps |
|---|---|
| `providers.user` | UserProvider |
| `providers.session` | SessionProvider (depends on user) |
| `providers.publisher` | PublisherProvider (depends on user, session) |
| `providers.backgroundPublisher` | BackgroundPublisherProvider (depends on user, session, publisher) |
| `providers.previewPublisher` | PreviewPublisherProvider (depends on user) |

Dependencies are resolved automatically — you only need to list the providers your component directly requires and `makeTestProvider` will include their dependencies.

Individual wrappers are also available if you only need one:

- `makePublisherProviderWrapper()`
- `makeSessionProviderWrapper()`
- `makeUserProviderWrapper()`
- `makePreviewPublisherProviderWrapper()`
- `makeBackgroundPublisherProviderWrapper()`

---

## Setup

Create a local `render` (or `renderHook`) helper that uses `makeTestProvider` to compose providers. Pass the wrapper to `@testing-library/react`.

### Component test

```typescript
import { render as renderBase } from '@testing-library/react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render(ui: ReactElement, { userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    userContext,
    sessionContext,
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
```

`makeTestProvider` returns `{ wrapper, userContext, sessionContext, ... }`. Destructuring into `{ wrapper, ...context }` gives you:
- `wrapper` — the composed React wrapper to pass to `render` or `renderHook`
- `context.userContext` — a ref (`{ current }`) pointing to the live `UserContext` value
- `context.sessionContext` — a ref pointing to the live `SessionContext` value
- (one ref per provider you listed)

Spreading `...context` into the return lets tests access and mutate live context values:

```typescript
const { sessionContext } = render(<MyComponent />);

// Read live context value
expect(sessionContext.current.connected).toBe(true);

// Trigger a state change via the context setter
act(() => sessionContext.current.setConnected(false));
```

### Hook test

```typescript
import { renderHook as renderHookBase } from '@testing-library/react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render({ userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    userContext,
    sessionContext,
  });

  return {
    ...context,
    ...renderHookBase(() => useMyHook(), { wrapper }),
  };
}
```

### Overriding initial user state with `value`

Pass `value` inside a context option to seed the provider's initial state:

```typescript
render(<MyComponent />, {
  userContext: {
    value: {
      defaultSettings: { name: 'Alice', publishAudio: true },
    },
  },
});
```

### Injecting values with `__interceptor`

Use `__interceptor` to inject or override values on a context object on every render. This is the preferred way to provide objects that are managed internally by a provider (e.g. `vonageVideoClient`):

```typescript
const mockForceMute = vi.fn();

render(<AudioIndicator />, {
  sessionContext: {
    __interceptor: (ctx) => {
      if (ctx) ctx.forceMute = mockForceMute;
    },
  },
});
```

The interceptor is called on every render, so it stays in sync when the context updates. Call the caller's interceptor at the end to allow chaining:

```typescript
// In a shared render helper
sessionContext: {
  ...sessionContext,
  __interceptor: (ctx) => {
    if (ctx) ctx.publish = mockedPublish;
    sessionContext?.__interceptor?.(ctx);  // chain caller's interceptor
  },
},
```

### One-time setup with `__onCreated`

Use `__onCreated` when you only need to set something up once at context creation (not on every re-render):

```typescript
render(<MyComponent />, {
  sessionContext: {
    __onCreated: (ctx) => {
      ctx.joinRoom = vi.fn();
    },
  },
});
```

## Best Practices

### 1. Create Providers Per-Test

Create wrappers individually for each test to ensure isolation.

```typescript
describe('MicButton', () => {
  it('shows unmuted state', () => {
    render(<MicButton />, {
      publisherContext: {
        initialValue: {
          isAudioEnabled: true,
        },
      },
    });
  });

  it('shows muted state', () => {
    render(<MicButton />, {
      publisherContext: {
        initialValue: {
          isAudioEnabled: false,
        },
      },
    });
  });
});
```

### 2. Use Minimal Providers

Choose the smallest wrapper needed for your test.

```typescript
// ✅ Component only needs user context
const { UserProviderWrapper } = makeUserProviderWrapper({...});

// ✅ Component needs session + user
const { SessionProviderWrapper } = makeSessionProviderWrapper({...});
```

### 3. Mock External Dependencies Per Test

Mock SDK behavior per test for specific scenarios.

```typescript
// Mock SDK per test with specific behavior
it('should handle camera error', () => {
  vi.mocked(OT.initPublisher).mockImplementation(() => {
    throw new Error('Camera not available');
  });
  // Test error handling...
});
```

### 4. Access Context Values via `.current`

Use context refs to verify or mutate internal state.

```typescript
const { sessionContext, rerender } = render(<MyComponent />, {
  sessionContext: {
    initialValue: {
      connected: true,
    },
  },
});

// Verify context state
expect(sessionContext.current.connected).toBe(true);

// Mutate context state
sessionContext.current.connected = false;
rerender(<MyComponent />);
```

### 5. Use `rerender()` After State Mutations

```typescript
sessionContext.current.connected = true;
rerender(<MyComponent />);

await waitFor(() => {
  expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
});
```

### 6. Query Elements Inside `waitFor()`

Avoid stale references by querying inside `waitFor()`:

```typescript
// ✅ GOOD: Query inside waitFor
await waitFor(() => {
  expect(screen.queryByText('Alert')).toBeInTheDocument();
});

// ❌ BAD: Stale reference
const alert = screen.queryByText('Alert');
await waitFor(() => expect(alert).toBeInTheDocument());
```

## Examples

### Component test

```typescript
describe('AudioIndicator', () => {
  const mockForceMute = vi.fn();

  it('renders Mic icon when unmuted', () => {
    render(<AudioIndicator hasAudio stream={mockStream} />, {
      sessionContext: {
        __interceptor: (ctx) => {
          if (ctx) ctx.forceMute = mockForceMute;
        },
      },
    });
    expect(screen.getByTestId('MicIcon')).toBeInTheDocument();
  });
});

function render(ui: ReactElement, { userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    userContext,
    sessionContext,
  });
  return { ...context, ...renderBase(ui, { wrapper }) };
}
```

### Headless synchronizer test

```typescript
describe('LoggerSynchronizer', () => {
  it('syncs userId, sessionId, and connectionId into the logger on mount', () => {
    render({
      sessionContext: {
        __interceptor: (ctx) => {
          if (ctx) ctx.vonageVideoClient = mockVonageVideoClient;
        },
      },
    });

    expect(mockSetContext).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionId: 'session-1',
      connectionId: 'connection-1',
    });
  });
});

function render({ userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session] as const, {
    userContext: {
      value: { defaultSettings: { name: 'user-1' } },
      ...userContext,
    },
    sessionContext,
  });
  return { ...context, ...renderBase(<LoggerSynchronizer />, { wrapper }) };
}
```

## Additional Resources

- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

For questions or issues, please reach out to the #video-solutions team.
