---
applyTo: "**/*.{spec,test}.{ts,tsx}"
---

# Test Authoring Instructions

These instructions apply to all test files across the codebase (unit, integration, backend, libs).

## Testing philosophy

- Do not overtest.
- Small helpers/components with one or two relevant behaviors should usually have one condensed, high-value test that validates the behavior end-to-end.
- Prefer business logic tests with clear input and expected output.
- Do not add snapshot tests. Screenshot-based assertions in integration tests (Playwright `toHaveScreenshot`) are the only allowed exception.
- After writing a test, evaluate quality:
  - Does it validate real functionality?
  - Or is it mostly validating test tooling, mocks, or framework internals?
- Avoid tests that only check a mocked value was returned because it was mocked.

## What to mock

| Mock | Do not mock |
|------|-------------|
| External SDKs (e.g. `@vonage/client-sdk-video`) | Application contexts |
| Browser APIs (e.g. `navigator.mediaDevices`) | Custom hooks |
| | Components |

## Mocking rules

- Do not overmock.
- Prefer spies over full module mocking whenever possible.
- Avoid mocking our own logic when the scenario can be prepared using real parameters, real state, or real providers.
- Keep mocking minimal and focused on third-party dependencies or APIs not available in the test environment.
- For typed mocked functions, always use `vi.mocked(...)`.
- `as Mocked<...>` type-casting in test files is banned.

## Provider/context testing rules

- Do not mock context for our own providers when #sym:makeTestProvider can be used.
- Compose only the providers strictly necessary for the scenario. Every extra provider increases test setup cost and coupling.
- Initialize provider state using provider options to prepare the use case.
- Use returned public contexts to inspect values and interact with exposed actions.

When a component requires providers, compose only what is needed:

```tsx
type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render(
  ui: ReactElement,
  { userContext, sessionContext }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session],
    { userContext, sessionContext }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
```

For hooks, the same principle applies:

```tsx
type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
};

function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  { userContext }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider([providers.user], {
    userContext,
  });

  return {
    ...context,
    ...renderHookBase(render, { wrapper }),
  };
}
```

## Async test rules

- Do not use `setTimeout` or arbitrary `waitForTimeout` calls to make async tests pass. They slow the suite and hide real timing issues.
- Use `waitFor` from `@testing-library/react` to wait for observable state changes instead only when necessary.
- Every async test must declare an explicit assertion count with `expect.assertions(n)`.
- Place `expect.assertions(n)` at the start of the async test body so tests fail if execution exits before assertions run.

## Shared test helpers

Before adding custom setup, check and reuse existing helpers in:

- `libs/common/test`
- `libs/common/testNode`
- `libs/common/testBrowser`

Useful existing helpers include:

- `libs/common/test/setup.ts`
  - Already clears mocks, restores spies, and unstubs globals after each test. Already included in the global test setup — do not duplicate.
- `libs/common/testNode/helpers/waitForEvent.ts`

### Banned boilerplate — already provided globally

Do not call any of the following in individual test files. They are already invoked for every test run via the global setup files (`frontend/src/test/setup.ts`, `libs/*/test/setup.ts`):

```ts
// Global cleanup — already runs after each test via mandatoryAfterEachCleanup()
cleanup();
vi.clearAllMocks();
vi.restoreAllMocks();
vi.unstubAllGlobals();
cancelablePromiseTracker.mockClear();

// Browser environment setup — already runs before each suite via setupFrontendTestEnvironment()
setupResizeObserverMock();
setupScrollIntoViewMock();
setupHtmlMediaElementGuards();
setupHtmlCanvasElementGuards();
setupCancelablePromiseHook();
```

Duplicating these calls in test files adds noise and can cause double-invocation side effects.
  - Useful for event-driven async tests.
- `libs/common/testBrowser/renderAsyncComponent.ts`
  - Use for components that resolve async behavior with Suspense boundaries.
- `libs/common/testBrowser/renderAsyncHook.ts`
  - Use for hooks that need async/Suspense-aware rendering.
- `libs/common/testBrowser/makeGenericProviderWrapper.tsx`
  - Generic provider/context wrapper utility for reusable context testing.
- `libs/common/testBrowser/fixtures/setupWindowNavigatorMock`
  - Browser navigator setup helpers for web media-related tests.

Do not duplicate setup that these helpers already provide.

## Test data setup

- Avoid high-level shared variables when possible.
- Prefer creating scenario-specific inputs inside each test.
- Prefer fewer, more robust tests instead of many tiny tests that increase suite runtime with low value.
- Keep tests explicit and linear, with clear Arrange/Act/Assert intent.
