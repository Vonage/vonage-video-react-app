# Frontend Unit Testing Guide

This guide explains how to write effective **frontend unit tests** in the Vonage Video React App using real providers instead of mocks.

> **Note:** This guide is for **frontend unit tests** (React components, hooks, contexts) located in `frontend/src/**/*.spec.tsx`. 
> For **integration tests** (end-to-end Playwright tests), see `/integration-tests`.

## Table of Contents

1. [Test Utilities Directory Structure](#test-utilities-directory-structure)
2. [Testing Philosophy](#testing-philosophy)
3. [What to Mock vs. What NOT to Mock](#what-to-mock-vs-what-not-to-mock)
4. [Provider Wrappers](#provider-wrappers)
5. [Quick Start Examples](#quick-start-examples)
6. [Best Practices](#best-practices)

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
│   ├── makeAppConfigProviderWrapper.ts
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
// ✅ GOOD: Real provider with test data
const { SessionProviderWrapper } = makeSessionProviderWrapper({
  userOptions: {
    userOptions: {
      value: {
        defaultSettings: { publishAudio: false },
        issues: { reconnections: 0, audioFallbacks: 0 },
      } as UserType,
    },
  },
});

render(<MyComponent />, { wrapper: SessionProviderWrapper });
```

```tsx
// ❌ BAD: Mocking application context
vi.mock('@hooks/useUserContext');
vi.mocked(useUserContext).mockReturnValue(fakeData);
```

---

## What to Mock vs. What NOT to Mock

### ✅ Mock External Dependencies

| Type | Examples | Why? |
|------|----------|------|
| **External SDKs** | `@vonage/client-sdk-video` | Requires network/API keys |
| **Browser APIs** | `navigator.mediaDevices` | Not available in Node test environment |

```typescript
// Mock external SDK (partial mock with fail-by-default)
vi.mock('@vonage/client-sdk-video', () => mockVonageVideoSDK());

// Mock browser API per test
it('should enumerate devices', () => {
  vi.mocked(navigator.mediaDevices).enumerateDevices.mockResolvedValue([
    { deviceId: 'audio1', kind: 'audioinput', label: 'Mic' } as MediaDeviceInfo,
  ]);
});
```

### ❌ DON'T Mock Application Code

| Type | Examples | Why NOT? |
|------|----------|----------|
| **Contexts** | `useUserContext()`, `usePublisherContext()` | Test real data flow |
| **Custom Hooks** | `usePublisherOptions()` | Verify actual behavior |
| **Components** | `<MicButton />` | Test real interactions |

```typescript
// ❌ WRONG
vi.mock('@hooks/useUserContext');

// ✅ CORRECT - Use real provider
const { UserProviderWrapper } = makeUserProviderWrapper({
  userOptions: {
    value: { defaultSettings: { publishAudio: true }, issues: { reconnections: 0 } } as UserType,
  },
});
```

---

## Provider Wrappers

### Basic Usage

```typescript
import { makeSessionProviderWrapper } from '@test/providers';
import { UserType } from '@Context/user';

const { SessionProviderWrapper, sessionContext, userContext, appConfigContext } = 
  makeSessionProviderWrapper({
    userOptions: {
      userOptions: {  // Double nesting for nested providers
        value: {
          defaultSettings: { publishAudio: false },
          issues: { reconnections: 0, audioFallbacks: 0 },
        } as UserType,
      },
    },
  });

render(<MyComponent />, { wrapper: SessionProviderWrapper });

// Access context values
expect(userContext.current?.defaultSettings.publishAudio).toBe(false);
```

### Available Wrappers

- `makeAppConfigProviderWrapper()` - AppConfig context only
- `makeUserProviderWrapper()` - User context only
- `makeSessionProviderWrapper()` - Session + User + AppConfig contexts
- `makePublisherProviderWrapper()` - Publisher + Session + User + AppConfig contexts
- `makeAudioOutputProviderWrapper()` - AudioOutput context only
- `makePreviewPublisherProviderWrapper()` - PreviewPublisher context only
- `makeBackgroundPublisherProviderWrapper()` - BackgroundPublisher context only

### Nesting Pattern

- **Single-level nesting** for direct wrappers:
  ```typescript
  makeUserProviderWrapper({ userOptions: { value: {...} } })
  ```

- **Double-level nesting** when wrapper composes other providers:
  ```typescript
  makeSessionProviderWrapper({
    userOptions: {
      userOptions: { value: {...} }  // Extra level for nested UserProvider
    }
  })
  ```

---

## Quick Start Examples

### Testing a Component

```typescript
import { render, screen } from '@testing-library/react';
import { makeSessionProviderWrapper } from '@test/providers';
import { UserType } from '@Context/user';

describe('MicButton', () => {
  it('displays muted state', () => {
    const { SessionProviderWrapper } = makeSessionProviderWrapper({
      userOptions: {
        userOptions: {
          value: {
            defaultSettings: { publishAudio: false },
            issues: { reconnections: 0, audioFallbacks: 0 },
          } as UserType,
        },
      },
    });

    render(<MicButton />, { wrapper: SessionProviderWrapper });
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
```

### Testing a Hook

```typescript
import { renderHook } from '@testing-library/react';
import { makeSessionProviderWrapper } from '@test/providers';

describe('usePublisherOptions', () => {
  it('returns options based on user settings', () => {
    const { SessionProviderWrapper } = makeSessionProviderWrapper({
      userOptions: {
        userOptions: {
          value: {
            defaultSettings: { publishAudio: false, noiseSuppression: true },
            issues: { reconnections: 0, audioFallbacks: 0 },
          } as UserType,
        },
      },
    });

    const { result } = renderHook(() => usePublisherOptions(), { wrapper: SessionProviderWrapper });
    expect(result.current.publishAudio).toBe(false);
  });
});
```

---

## Best Practices

### 1. Create Providers Per-Test

Create wrappers individually for each test to ensure isolation.

```typescript
describe('MicButton', () => {
  it('shows unmuted state', () => {
    const { SessionProviderWrapper } = makeSessionProviderWrapper({
      userOptions: {
        userOptions: {
          value: {
            defaultSettings: { publishAudio: true },
            issues: { reconnections: 0, audioFallbacks: 0 },
          } as UserType,
        },
      },
    });
    render(<MicButton />, { wrapper: SessionProviderWrapper });
  });

  it('shows muted state', () => {
    const { SessionProviderWrapper } = makeSessionProviderWrapper({
      userOptions: {
        userOptions: {
          value: {
            defaultSettings: { publishAudio: false },
            issues: { reconnections: 0, audioFallbacks: 0 },
          } as UserType,
        },
      },
    });
    render(<MicButton />, { wrapper: SessionProviderWrapper });
  });
});
```

### 2. Use Minimal Providers

Choose the smallest wrapper needed for your test.

```typescript
// ✅ Component only needs user context
const { UserProviderWrapper } = makeUserProviderWrapper({...});

// ✅ Component needs session + user + appConfig
const { SessionProviderWrapper } = makeSessionProviderWrapper({...});
```

### 3. Mock External Dependencies Per Test

```typescript
// Mock SDK per test with specific behavior
it('should handle camera error', () => {
  vi.mocked(OT.initPublisher).mockImplementation(() => {
    throw new Error('Camera not available');
  });
  
  // Test error handling...
});
```

### 4. Access Context Values

Use context refs to verify internal state.

```typescript
const { SessionProviderWrapper, userContext } = makeSessionProviderWrapper({...});

render(<MyComponent />, { wrapper: SessionProviderWrapper });

// Verify context state
expect(userContext.current?.defaultSettings.publishAudio).toBe(false);
```


## Additional Resources

- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

For questions or issues, please reach out to the #video-solutions team.
