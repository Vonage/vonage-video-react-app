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
- A test must set up the state its own description claims to exercise. If the name says a value is restored, migrated or applied, arrange that starting state — a test that passes without it proves nothing and should be deleted rather than kept for coverage.
- Do not wrap a single test in its own `describe` block.
- A presentational component with no logic of its own gets one render test, not a suite. Asserting that MUI and React rendered the props you passed tests the framework, not your code, and it lengthens every CI run for nothing.
- Test file naming follows the project you are in: `frontend` uses `*.spec.ts(x)`; `libs` and `backend` follow the existing convention of the package.

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

### Global stores are not contexts

`makeTestProvider` is for **real React context providers only**. Global stores created with `react-global-state-hooks/createGlobalState` — the `$` stores such as `advancedSettings$` — have no provider and must not be routed through it. Prepare them directly:

```tsx
beforeEach(() => {
  advancedSettings$.reset();
});

it('renders the custom audio bitrate slider when custom mode is selected', () => {
  advancedSettings$.actions.setAudioBitrateMode('custom');

  render(<AdvancedSettingsAudioTab />);

  expect(screen.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeInTheDocument();
});
```

The presence of a key in the `providers` enum is not proof that the thing behind it is a context — check how it is created before reaching for a wrapper.

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

Also avoid, for the same reason:

- `vi.resetModules()` — almost never needed. If a test only works with a freshly imported module, question the test rather than reaching for this.
- Cleanup in `afterEach` that repeats what `beforeEach` already does. A test must never depend on the previous test having cleaned up after it; prepare the state you need in `beforeEach` instead.
- Section-banner comments (`// Mock dependencies`, `// Arrange`). If a test needs signposting, split it.
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
