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

- `makePublisherProviderWrapper()` - Publisher + Session + User
- `makeSessionProviderWrapper()` - Session + User  
- `makeUserProviderWrapper()` - User only
- `makeAudioOutputProviderWrapper()` - AudioOutput only
- `makePreviewPublisherProviderWrapper()` - PreviewPublisher only
- `makeBackgroundPublisherProviderWrapper()` - BackgroundPublisher only

---

## Setup

Create a custom `render` helper function that wraps components with providers:

```typescript
import { render as renderBase } from '@testing-library/react';
import { makePublisherProviderWrapper, PublisherProviderWrapperOptions } from '@test/providers';

function render(ui: ReactElement, options: PublisherProviderWrapperOptions = {}) {
  const { PublisherProviderWrapper, ...props } = makePublisherProviderWrapper(options);

  return {
    ...props,
    ...renderBase(ui, { wrapper: PublisherProviderWrapper }),
  };
}

// Use in tests
const { sessionContext, publisherContext } = render(<MyComponent />, {
  publisherContext: {
    initialValue: {
      publisher: mockPublisher,
      isPublishing: true,
    },
  },
  sessionContext: {
    initialValue: {
      connected: true,
    },
  },
});

// Access context values
expect(sessionContext.current.connected).toBe(true);
```

### Initial State with `initialValue`

Use `initialValue` to set the initial state of a context provider declaratively:

```typescript
render(<MyComponent />, {
  publisherContext: {
    initialValue: {
      publisher: mockPublisher,
      isPublishing: true,
      isVideoEnabled: true,
    },
  },
  sessionContext: {
    initialValue: {
      connected: true,
      layoutMode: 'active-speaker',
    },
  },
});
```

### Mocking Methods with `__onCreated`

Use `__onCreated` callback to mock methods on context. Create the mock outside for assertions:

```typescript
const publishMock = vi.fn();
const joinRoomMock = vi.fn();

const { sessionContext, publisherContext } = render(<MyComponent />, {
  publisherContext: {
    __onCreated: (context) => {
      context.publish = publishMock;  // Assign external mock
    },
  },
  sessionContext: {
    __onCreated: (context) => {
      context.joinRoom = joinRoomMock;
    },
  },
});

// Assert on external mock
expect(joinRoomMock).toHaveBeenCalledWith('room-name');
expect(publishMock).toHaveBeenCalledTimes(1);
```

### Combining `initialValue` and `__onCreated`

You can use both together - `initialValue` for state, `__onCreated` for methods:

```typescript
const publishMock = vi.fn();

const { rerender, sessionContext } = render(<MeetingRoom />, {
  publisherContext: {
    initialValue: {
      isVideoEnabled: true,
      quality: 'poor',
    },
    __onCreated: (context) => {
      context.publish = publishMock;
    },
  },
  sessionContext: {
    initialValue: {
      connected: false,
    },
  },
});

sessionContext.current.connected = true;
rerender(<MyComponent />);

await waitFor(() => {
  expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
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

### Component Test

```typescript
describe('MicButton', () => {
  it('displays muted state', () => {
    render(<MicButton />, {
      publisherContext: { initialValue: { isAudioEnabled: false } },
    });
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
```

### Hook Test

```typescript
const { PublisherProviderWrapper } = makePublisherProviderWrapper({
  publisherContext: { initialValue: { isAudioEnabled: false } },
});
const { result } = renderHook(() => usePublisherOptions(), { wrapper: PublisherProviderWrapper });
expect(result.current.publishAudio).toBe(false);
```

## Additional Resources

- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

For questions or issues, please reach out to the #video-solutions team.
