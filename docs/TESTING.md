# Frontend Unit Testing Guide

This guide explains how to write effective **frontend unit tests** in the Vonage Video React App using real providers instead of mocks.

> **Note:** This guide is for **frontend unit tests** (React components, hooks, contexts) located in `frontend/src/**/*.spec.tsx`. 
> For **integration tests** (end-to-end Playwright tests), see `/integration-tests`.

## Table of Contents

1. [Test Utilities Directory Structure](#test-utilities-directory-structure)
2. [Testing Philosophy](#testing-philosophy)
3. [What to Mock vs. What NOT to Mock](#what-to-mock-vs-what-not-to-mock)
4. [Available Test Utilities](#available-test-utilities)
5. [Quick Start Examples](#quick-start-examples)
6. [Migration Guide](#migration-guide)
7. [Best Practices & Common Patterns](#best-practices--common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Test Utilities Directory Structure

The test utilities are located in `frontend/src/test/`:

```
frontend/src/test/
├── fixtures/          # Reusable test data (user fixtures, etc.)
│   ├── userFixtures.ts
│   └── index.ts
├── mocks/             # External dependency mocks (SDK, browser APIs)
│   ├── vonageVideo.ts
│   ├── mediaDevices.ts
│   └── index.ts
├── providers/         # Provider wrappers and composers
│   ├── makeUserProviderWrapper.ts
│   ├── makePublisherProviderWrapper.ts
│   ├── createTestProviderStack.tsx
│   └── index.ts
├── globals.ts         # Global test configuration
└── setup.ts           # Test setup and teardown
```

---

## Testing Philosophy

### ✅ DO: Use Real Providers

Tests should use **real application context providers** to validate actual data flow and component behavior.

```tsx
// ✅ GOOD: Real providers with test data
import { createTestProviderStack } from '@test/providers';

const wrapper = createTestProviderStack({
  user: createUserFixture({ defaultSettings: { publishAudio: false } }),
});

renderHook(() => usePublisherContext(), { wrapper });
```

### ❌ DON'T: Mock Application Contexts

Avoid mocking application contexts as it creates artificial test environments that don't reflect real usage.

```tsx
// ❌ BAD: Mocking our own context hooks
vi.mock('@hooks/useUserContext');
vi.mocked(useUserContext).mockReturnValue(fakeData);
```

### ✅ DO: Mock External Dependencies

Only mock external SDKs and browser APIs that we don't control.

```tsx
// ✅ GOOD: Mock external SDKs
vi.mock('@vonage/client-sdk-video', () => mockVonageVideoSDK);
```

---

## What to Mock vs. What NOT to Mock

This is a **critical distinction** for understanding how to create effective tests.

### ✅ **DO Mock: External Dependencies**

These are libraries and APIs **outside our control** that interact with external systems:

| Category | Examples | Why Mock? |
|----------|----------|-----------|
| **External SDKs** | `@vonage/client-sdk-video`, `@vonage/auth` | Third-party libraries that make network calls or depend on external services |
| **Browser APIs** | `navigator.mediaDevices`, `localStorage`, `WebRTC APIs` | Platform APIs that aren't available in test environment |
| **Native APIs** | `MediaStream`, `RTCPeerConnection` | Browser-native objects that require real hardware |

```typescript
// ✅ CORRECT: Mock external SDK
vi.mock('@vonage/client-sdk-video', () => mockVonageVideoSDK);

// ✅ CORRECT: Mock browser API
beforeEach(() => {
  mockMediaDevices.setupMockMediaDevices();
});
```

**Why these mocks are necessary:**
- External SDKs require API keys, network access, or external services
- Browser APIs aren't available in Node.js test environment (Vitest runs in Node)
- Real hardware (camera/microphone) isn't available during CI/CD

### ❌ **DON'T Mock: Application Code**

These are **our own** contexts, hooks, and components that we control:

| Category | Examples | Why NOT Mock? |
|----------|----------|--------------|
| **Application Contexts** | `useUserContext()`, `usePublisherContext()` | We want to test real data flow through our app |
| **Custom Hooks** | `usePublisherOptions()`, `useDeviceManager()` | We want to verify actual hook behavior |
| **Application Components** | `<MicButton />`, `<VideoView />` | We want to test real component interactions |

```typescript
// ❌ WRONG: Don't mock our own contexts
vi.mock('@hooks/useUserContext');  // Remove this!
vi.mocked(useUserContext).mockReturnValue(fakeData);  // Don't do this!

// ✅ CORRECT: Use real providers instead
const wrapper = createTestProviderStack({
  user: createUserFixture({ ... }),
});
render(<MyComponent />, { wrapper });
```

**Why these should NOT be mocked:**
- Mocking our own code creates **artificial test environments**
- Tests pass but **don't validate real behavior**
- Bugs can slip through because **data flow isn't tested**
- Refactoring becomes risky because **tests don't catch breaking changes**

### 📋 **Quick Reference: Mock or Not?**

```typescript
// ✅ MOCK: External dependencies
vi.mock('@vonage/client-sdk-video', () => mockVonageVideoSDK);  // ✅ YES
Object.defineProperty(globalThis.navigator, 'mediaDevices', ...);  // ✅ YES
vi.spyOn(OT, 'initPublisher').mockImplementation(...);  // ✅ YES

// ❌ DON'T MOCK: Our application code
vi.mock('@hooks/useUserContext');  // ❌ NO - use real UserProvider
vi.mock('@hooks/usePublisherContext');  // ❌ NO - use real PublisherProvider
vi.mock('@Context/AudioOutputProvider');  // ❌ NO - use real AudioOutputProvider
```

### 🎯 **Rule of Thumb**

**Ask yourself:** *"Do we control this code?"*
- **NO (external)** → ✅ Mock it
- **YES (our app)** → ❌ Use real implementation with test data

---

## Available Test Utilities

### 1. Test Fixtures

Reusable test data for consistent state across tests.

```typescript
import {
  defaultUserFixture,
  mutedUserFixture,
  createUserFixture,
} from '@test/fixtures';

// Use predefined fixtures
const wrapper = createTestProviderStack({ user: mutedUserFixture });

// Or create custom fixtures
const customUser = createUserFixture({
  defaultSettings: {
    name: 'Custom Test User',
    publishVideo: false,
  },
});
```

### 2. Provider Wrappers

Individual provider wrappers for targeted testing.

```typescript
import { makeUserProviderWrapper } from '@test/providers';

const { UserProviderWrapper, userContext } = makeUserProviderWrapper({
  value: defaultUserFixture,
});

// Use in tests
render(<MyComponent />, { wrapper: UserProviderWrapper });

// Access context value
expect(userContext.current.user.defaultSettings.name).toBe('Test User');
```

### 3. Provider Stack Composer

Compose multiple providers into a single wrapper.

```typescript
import { createTestProviderStack } from '@test/providers';

// Default configuration (includes all providers)
const wrapper = createTestProviderStack();

// Selective providers
const minimalWrapper = createTestProviderStack({
  includePublisher: false,
  includeBackgroundPublisher: false,
});

// Custom data
const customWrapper = createTestProviderStack({
  user: createUserFixture({ defaultSettings: { publishAudio: false } }),
  appConfig: { features: { captionsEnabled: false } },
});
```

### 4. External SDK Mocks

Centralized mocks for external dependencies.

```typescript
import { mockVonageVideoSDK, mockMediaDevices } from '@test/mocks';

// In test file
vi.mock('@vonage/client-sdk-video', () => mockVonageVideoSDK);

// Setup media devices
beforeEach(() => {
  mockMediaDevices.setupMockMediaDevices();
});

afterEach(() => {
  mockMediaDevices.restoreMediaDevices();
});
```

---

## Quick Start Examples

### Testing a Hook

```typescript
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createTestProviderStack } from '@test/providers';
import { createUserFixture } from '@test/fixtures';
import usePublisherOptions from './usePublisherOptions';

describe('usePublisherOptions', () => {
  it('returns publisher options based on user settings', () => {
    const user = createUserFixture({
      defaultSettings: {
        publishAudio: false,
        publishVideo: true,
        noiseSuppression: true,
      },
    });

    const wrapper = createTestProviderStack({ user });
    const { result } = renderHook(() => usePublisherOptions(), { wrapper });

    expect(result.current.publishAudio).toBe(false);
    expect(result.current.publishVideo).toBe(true);
  });
});
```

### Testing a Component

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createTestProviderStack } from '@test/providers';
import { mockVonageVideoSDK } from '@test/mocks';
import MicButton from './MicButton';

// Mock external SDK
vi.mock('@vonage/client-sdk-video', () => mockVonageVideoSDK);

describe('MicButton', () => {
  it('displays muted state correctly', () => {
    const wrapper = createTestProviderStack({
      user: createUserFixture({
        defaultSettings: { publishAudio: false },
      }),
    });

    render(<MicButton />, { wrapper });

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
```

### Testing with Multiple Contexts

```typescript
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createTestProviderStack } from '@test/providers';
import { mockVonageVideoSDK } from '@test/mocks';
import usePublisher from './usePublisher';

vi.mock('@vonage/client-sdk-video', () => mockVonageVideoSDK);

describe('usePublisher', () => {
  it('initializes publisher with user settings', async () => {
    const wrapper = createTestProviderStack({
      user: createUserFixture({
        defaultSettings: {
          publishAudio: true,
          publishVideo: true,
          audioSource: 'test-mic-id',
        },
      }),
    });

    const { result } = renderHook(() => usePublisher(), { wrapper });

    await result.current.initLocalPublisher();

    expect(mockVonageVideoSDK.initPublisher).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        publishAudio: true,
        publishVideo: true,
      }),
      expect.any(Function)
    );
  });
});
```

---

<!-- 
  TODO: REMOVE MIGRATION GUIDE BEFORE FINAL COMMIT
  This section is only needed during the VIDSOL-303 refactoring task.
  Once all tests are migrated to use real providers, this section becomes obsolete.
  New developers should use the "Quick Start Examples" section instead.
-->

## Migration Guide

### Before: Mocked Contexts

```typescript
// ❌ OLD APPROACH
vi.mock('@hooks/useUserContext');
vi.mock('@hooks/usePublisherContext');

describe('MyComponent', () => {
  beforeEach(() => {
    vi.mocked(useUserContext).mockReturnValue({
      user: { defaultSettings: { publishAudio: false } },
      setUser: vi.fn(),
    });

    vi.mocked(usePublisherContext).mockReturnValue({
      publisher: null,
      initLocalPublisher: vi.fn(),
    });
  });

  it('renders correctly', () => {
    render(<MyComponent />);
  });
});
```

### After: Real Providers

```typescript
// ✅ NEW APPROACH
import { createTestProviderStack } from '@test/providers';
import { createUserFixture } from '@test/fixtures';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = createTestProviderStack({
      user: createUserFixture({
        defaultSettings: { publishAudio: false },
      }),
    });

    render(<MyComponent />, { wrapper });
  });
});
```

### Step-by-Step Migration

1. **Remove context mocks**
   ```typescript
   // Remove these lines:
   vi.mock('@hooks/useUserContext');
   vi.mocked(useUserContext).mockReturnValue(...);
   ```

2. **Add provider wrapper**
   ```typescript
   // Add:
   import { createTestProviderStack } from '@test/providers';
   const wrapper = createTestProviderStack();
   ```

3. **Update render/renderHook calls**
   ```typescript
   // Before:
   render(<MyComponent />);
   
   // After:
   render(<MyComponent />, { wrapper });
   ```

4. **Keep external SDK mocks**
   ```typescript
   // Keep:
   vi.mock('@vonage/client-sdk-video', () => mockVonageVideoSDK);
   ```

---

## Best Practices & Common Patterns

### 1. Use Fixtures for Consistency

Reuse predefined fixtures across tests to ensure consistent test data and reduce boilerplate.

```typescript
import { defaultUserFixture, mutedUserFixture } from '@test/fixtures';

describe('MicButton', () => {
  it('shows unmuted state', () => {
    const wrapper = createTestProviderStack({ user: defaultUserFixture });
    // ...
  });

  it('shows muted state', () => {
    const wrapper = createTestProviderStack({ user: mutedUserFixture });
    // ...
  });
});
```

### 2. Only Include Necessary Providers

Keep provider stacks minimal to improve test performance and clarity.

```typescript
// ✅ GOOD: Minimal provider stack for focused tests
const wrapper = createTestProviderStack({
  includePublisher: false,
  includeBackgroundPublisher: false,
  // Only includes User and AppConfig
});
```

### 3. Test Real Data Flow and Context Updates

Test actual behavior and state changes rather than mocked responses.

```typescript
// Testing context updates
it('updates context when user changes settings', () => {
  const wrapper = createTestProviderStack();
  const { result } = renderHook(() => useUserContext(), { wrapper });

  act(() => {
    result.current.setUser(prev => ({
      ...prev,
      defaultSettings: { ...prev.defaultSettings, publishAudio: false },
    }));
  });

  expect(result.current.user.defaultSettings.publishAudio).toBe(false);
});

// Testing data flow between contexts
it('updates publisher when user changes audio source', async () => {
  const wrapper = createTestProviderStack();
  const { result } = renderHook(() => {
    const user = useUserContext();
    const publisher = usePublisherContext();
    return { user, publisher };
  }, { wrapper });

  // Act: Change user settings
  act(() => {
    result.current.user.setUser(prev => ({
      ...prev,
      defaultSettings: {
        ...prev.defaultSettings,
        audioSource: 'new-mic-id',
      },
    }));
  });

  // Assert: Publisher reacts to real state change
  expect(mockVonageVideoSDK.initPublisher).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ audioSource: 'new-mic-id' }),
    expect.any(Function)
  );
});
```

### 4. Access Provider Context Value Directly

When testing provider behavior, use individual wrappers to access context values.

```typescript
it('provides correct initial context value', () => {
  const { UserProviderWrapper, userContext } = makeUserProviderWrapper({
    value: defaultUserFixture,
  });

  render(<TestComponent />, { wrapper: UserProviderWrapper });

  // Access the context value directly for assertions
  expect(userContext.current.user.defaultSettings.name).toBe('Test User');
});
```

### 5. Clean Setup and Teardown

Keep test setup minimal and leverage automatic cleanup.

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    // Setup external mocks only
    mockMediaDevices.setupMockMediaDevices();
  });

  afterEach(() => {
    // Cleanup is automatic with @testing-library/react
    // Only add custom cleanup for external mocks:
    mockMediaDevices.restoreMediaDevices();
  });

  it('test case', () => {
    const wrapper = createTestProviderStack();
    render(<MyComponent />, { wrapper });
  });
});
```

### 6. Document Complex Test Setups

Add comments explaining test scenarios when using multiple providers or complex configurations.

```typescript
it('handles complex multi-provider interaction', () => {
  // Arrange: User with background blur enabled, app allows background effects
  const wrapper = createTestProviderStack({
    user: createUserFixture({
      defaultSettings: {
        publishAudio: true,
        publishVideo: false,
        backgroundFilter: { type: 'backgroundBlur', blurStrength: 'high' },
      },
    }),
    appConfig: {
      features: {
        backgroundEffectsEnabled: true,
      },
    },
  });

  // Act & Assert...
});
```

---

## Troubleshooting

### Issue: "Cannot find context"

**Problem:** Component tries to use context outside provider.

**Solution:** Ensure you're passing the wrapper to render/renderHook:

```typescript
// ❌ Missing wrapper
render(<MyComponent />);

// ✅ With wrapper
const wrapper = createTestProviderStack();
render(<MyComponent />, { wrapper });
```

### Issue: "Too many re-renders"

**Problem:** State update causing infinite loop.

**Solution:** Use `act()` for state updates and check dependencies:

```typescript
await act(async () => {
  await result.current.someAsyncFunction();
});
```

### Issue: "Mock not being called"

**Problem:** Using real provider but expecting mock to be called.

**Solution:** Ensure you're mocking external SDKs, not application code:

```typescript
// ✅ Mock external SDK
vi.mock('@vonage/client-sdk-video', () => mockVonageVideoSDK);

// ❌ Don't mock application contexts
// vi.mock('@hooks/useUserContext');  // Remove this!
```

---

## Additional Resources

- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

For questions or issues with test utilities, please reach out to the team or open a discussion in the repository.
