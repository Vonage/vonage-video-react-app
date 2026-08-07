# Web (Browser) Test Utilities

Exports available from `@vonage/video-common/web/test`. Re-exports everything from [universal test utilities](./universal.test.md) plus browser-specific test infrastructure.

---

## environment

### setupFrontendTestEnvironment

Configures the full browser test environment. Call once in your test setup file (`beforeAll` or setup script). Sets up:

- `ResizeObserver` mock
- `scrollIntoView` mock
- `HTMLMediaElement` guards (prevents errors from `play()`/`pause()` on detached elements)
- `HTMLCanvasElement` guards
- Cancelable promise tracking

```ts
import { setupFrontendTestEnvironment } from '@vonage/video-common/web/test';

beforeAll(() => {
  setupFrontendTestEnvironment();
});
```

### mandatoryAfterEachCleanup

Enforces clean, isolated test state after every test. Runs:
- `cleanup()` (React Testing Library DOM cleanup)
- `vi.clearAllMocks()` / `vi.restoreAllMocks()` / `vi.unstubAllGlobals()`
- `cancelablePromiseTracker.mockClear()`

Call this in `afterEach` — it guarantees that no test leaks state into the next.

```ts
import { mandatoryAfterEachCleanup } from '@vonage/video-common/web/test';

afterEach(() => {
  mandatoryAfterEachCleanup();
});
```

### cancelablePromiseTracker

Re-exported from universal test. See [universal.test.md#cancelablePromiseTracker](./universal.test.md#cancelablepromisetracker).

---

## render helpers

### renderAsyncComponent

Renders a React component that uses `SuspenseBoundary` and async hooks (`use$`, `useSuspenseMemo`). Wraps with the specified providers and waits for Suspense to resolve before returning.

```ts
import { renderAsyncComponent } from '@vonage/video-common/web/test';

const { getByText } = await renderAsyncComponent(<MyAsyncComponent />, {
  wrapper: AppProviders,
});

expect(getByText('Loaded')).toBeInTheDocument();
```

### renderAsyncHook

Renders a hook that depends on Suspense. Similar to `renderHook` from React Testing Library but handles async resolution.

```ts
import { renderAsyncHook } from '@vonage/video-common/web/test';

const { result } = await renderAsyncHook(() => useSuspenseMemo(() => fetchData(), []));
expect(result.current).toEqual(expectedData);
```

### makeGenericProviderWrapper

Creates a provider wrapper component from a list of providers. Useful for `renderHook` and `render` options.

```ts
import { makeGenericProviderWrapper } from '@vonage/video-common/web/test';

const wrapper = makeGenericProviderWrapper([ThemeProvider, AuthProvider]);
const { result } = renderHook(() => useAuth(), { wrapper });
```

---

## fixtures

### makeMediaDeviceInfos / device ID constants

```ts
import { makeMediaDeviceInfos, frontCameraId, rearCameraId } from '@vonage/video-common/web/test';
```

### Platform mocks

| Export | Description |
|---|---|
| `mockPlatformModule` | Mocks the platform detection module |
| `makeWindowNavigatorMock` | Creates a mock `navigator` object |
| `makeMediaStreamMock` | Creates a mock `MediaStream` |
| `setupWindowNavigatorMock` | Stubs `window.navigator` with a mock |

---

## mocks

Pre-built mock objects for browser APIs.

| Export | Description |
|---|---|
| `mediaDevicesMock` | Mock `navigator.mediaDevices` |
| `permissionsMock` | Mock `navigator.permissions` |
| `mediaStreamMock` | Mock `MediaStream` instance |

---

## providers

### makeMemoryRouterWrapper

Creates a `MemoryRouter` wrapper for testing components that use `react-router-dom`.

```ts
import { makeMemoryRouterWrapper } from '@vonage/video-common/web/test';

const wrapper = makeMemoryRouterWrapper(['/room/test-room']);
const { getByText } = render(<RoomPage />, { wrapper });
```
