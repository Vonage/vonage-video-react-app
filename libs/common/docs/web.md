# Web (Browser) API

All exports available from `@vonage/video-common/web`. This entry re-exports everything from the [universal layer](./universal.md) — only browser-specific additions are documented here.

---

## hooks

React hooks for async control flow, stable references, and Suspense integration.

```ts
import { use$, useStableCallback, useSuspenseMemo, useStableRef } from '@vonage/video-common/web/hooks';
```

---

### use$

Context-aware wrapper for React's `use()`. Must be used inside a `SuspenseBoundary`. Throws at runtime if used outside one — preventing silent crashes.

```ts
import use$ from '@vonage/video-common/web/hooks/use$';

const MyComponent = () => {
  const data = use$(fetchDataPromise);
  return <div>{data.name}</div>;
};
```

---

### useSuspenseMemo

Async `useMemo` via Suspense. Runs the callback once per dependency change. If the callback returns a Promise, the component suspends until it resolves.

```ts
import useSuspenseMemo from '@vonage/video-common/web/hooks/useSuspenseMemo';

const UserProfile = ({ userId }: { userId: string }) => {
  const profile = useSuspenseMemo(() => fetchProfile(userId), [userId]);

  // profile is the resolved value — no null checks needed
  return <h1>{profile.name}</h1>;
};
```

---

### useStableCallback

Returns a stable function reference that always calls the latest version of the provided callback. Prevents unnecessary re-renders when passing callbacks as props.

```ts
import useStableCallback from '@vonage/video-common/web/hooks/useStableCallback';

const handleClick = useStableCallback((event: MouseEvent) => {
  // always has access to latest closure values
  submitForm(currentFormState);
});

// handleClick reference never changes — safe for React.memo children
<Button onClick={handleClick} />
```

---

### useStableRef

Creates a stable ref with three overloads:

1. **Simple ref** — holds a value, updates on every render
2. **Computed ref** — runs a builder on dependency change (pure, no side effects)
3. **Disposable ref** — runs builder on mount, runs cleanup on unmount/dependency change

```ts
import useStableRef from '@vonage/video-common/web/hooks/useStableRef';

// 1. Simple ref
const latestValue = useStableRef(someValue);

// 2. Computed ref (rebuilt when deps change)
const parsed = useStableRef(() => JSON.parse(rawData), [rawData]);

// 3. Disposable ref (created on mount, cleaned up on unmount)
const publisher = useStableRef(
  () => OT.initPublisher(container, options),
  (pub) => pub.destroy(),
  [container, options]
);
```

---

### useSuspenseMemo vs use$

| Hook | Use when |
|---|---|
| `use$` | You already have a Promise and want to unwrap it inside a SuspenseBoundary |
| `useSuspenseMemo` | You need to compute/fetch a value with dependency tracking and Suspense |

Both require the component to be wrapped in `<SuspenseBoundary>`.

---

### useMountEffect

Runs a callback once on mount. Semantic alternative to `useEffect(() => ..., [])`.

```ts
import useMountEffect from '@vonage/video-common/web/hooks/useMountEffect';

useMountEffect(() => {
  loadInitialData();
});
```

---

### useAccumulator

Accumulates values over time. Each call adds to the collection without replacing previous values.

```ts
import useAccumulator from '@vonage/video-common/web/hooks/useAccumulator';

const [items, addItem] = useAccumulator<string>();
addItem('first');
addItem('second');
// items = ['first', 'second']
```

---

### useAnchorElement

Manages an anchor element reference for positioning (popovers, tooltips, dropdowns).

```ts
import useAnchorElement from '@vonage/video-common/web/hooks/useAnchorElement';

const { anchorElement, setAnchorElement, clearAnchorElement } = useAnchorElement();

<Button ref={setAnchorElement}>Open</Button>
<Popover anchorEl={anchorElement} onClose={clearAnchorElement}>...</Popover>
```

---

### useAssertSuspense

Throws if the component is not wrapped in a `SuspenseBoundary`. Used internally by `use$` and `useSuspenseMemo`.

```ts
import useAssertSuspense from '@vonage/video-common/web/hooks/useAssertSuspense';

useAssertSuspense('MyHook must be used within a SuspenseBoundary');
```

---

### useDebouncedValue

Returns a debounced version of a value. Updates only after the specified delay since the last change.

```ts
import useDebouncedValue from '@vonage/video-common/web/hooks/useDebouncedValue';

const debouncedSearch = useDebouncedValue(searchInput, 300);
// Use debouncedSearch for API calls — won't fire on every keystroke
```

---

### useDidUnmountRef

Returns a ref that becomes `true` when the component unmounts. Useful for guarding async callbacks.

```ts
import useDidUnmountRef from '@vonage/video-common/web/hooks/useDidUnmountRef';

const didUnmount = useDidUnmountRef();

const loadData = async () => {
  const data = await fetchData();
  if (didUnmount.current) return; // component gone, skip setState
  setData(data);
};
```

---

### useRenderCount

Returns how many times the component has rendered. Useful for debugging.

```ts
import useRenderCount from '@vonage/video-common/web/hooks/useRenderCount';

const renderCount = useRenderCount();
console.log(`Rendered ${renderCount} times`);
```

---

## components

### SuspenseBoundary

Context-aware wrapper for React `Suspense`. Provides context that `use$` and `useSuspenseMemo` check at runtime — preventing accidental use outside a boundary.

```ts
import { SuspenseBoundary } from '@vonage/video-common/web/components';

<SuspenseBoundary fallback={<Skeleton />}>
  <AsyncComponent />
</SuspenseBoundary>
```

Prefer skeleton placeholders over spinners for the fallback.

---

## platform

Browser detection utilities.

```ts
import { isMobile, isFirefox, isWebKit, isSinkIdSupported } from '@vonage/video-common/web/platform';
```

| Export | Description |
|---|---|
| `isMobile()` | Returns `true` if the device is mobile (uses `ua-parser-js`) |
| `isFirefox()` | Returns `true` if the browser is Firefox |
| `isWebKit()` | Returns `true` if the browser engine is WebKit |
| `isSinkIdSupported()` | Returns `true` if the browser supports `setSinkId` for audio output |

```ts
import isMobile from '@vonage/video-common/web/platform/isMobile';

if (isMobile()) {
  // use mobile-optimized layout
}
```

---

## helpers

### composeProviders

Composes multiple React context providers into a single wrapper. Avoids deeply nested JSX.

```ts
import composeProviders from '@vonage/video-common/web/helpers/composeProviders';
import type { ProviderComponent } from '@vonage/video-common/web/helpers';

const AppProviders = composeProviders(
  ThemeProvider,
  AuthProvider,
  SessionProvider,
);

// Usage — single wrapper instead of 3 nested providers
<AppProviders>
  <App />
</AppProviders>
```

Also exports: `mergeDefaultDeviceLabel`, `translateMediaDeviceLabel` — utilities for normalizing `MediaDeviceInfo` labels across browsers.

---

## assertions

### createStoreApiAssertion

Creates a runtime assertion function that validates a store API shape matches the expected interface at initialization time.

```ts
import { createStoreApiAssertion } from '@vonage/video-common/web/assertions';
```

---

## schemas

Re-exports all [universal schemas](./universal.md#schemas) plus browser-specific ones:

| Export | Validates |
|---|---|
| `MediaDeviceInfoSchema` | Browser `MediaDeviceInfo` shape |
| `DeviceKindSchema` | Device kind (`audioinput`, `videoinput`, `audiooutput`) |

```ts
import { MediaDeviceInfoSchema } from '@vonage/video-common/web/schemas';

const device = MediaDeviceInfoSchema.parse(rawDevice);
```

---

## types

Re-exports all [universal types](./universal.md#types) plus:

| Export | Description |
|---|---|
| `MediaDeviceInfoJSON` | Serializable representation of `MediaDeviceInfo` |
