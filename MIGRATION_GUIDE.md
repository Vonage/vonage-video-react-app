# Test Provider Migration Guide

## Summary of Changes

All provider makers have been refactored to follow a simpler pattern. They now only return `{ wrapper, context }` without managing dependencies themselves. The `makeTestProvider` function handles provider composition and dependencies.

## What Was Changed

### Provider Makers Refactored

All of these makers now follow the same simple pattern:

- `makeAppConfigProviderWrapper` ✅ (was already correct)
- `makeUserProviderWrapper` ✅
- `makeAudioOutputProviderWrapper` ✅
- `makeSessionProviderWrapper` ✅
- `makePublisherProviderWrapper` ✅
- `makePreviewPublisherProviderWrapper` ✅
- `makeBackgroundPublisherProviderWrapper` ✅

### Old Pattern (Complex)

```tsx
function makeSessionProviderWrapper({
  sessionOptions,
  appConfigOptions,
  userOptions,
  AppConfigWrapper,
  UserProviderWrapper,
}: SessionProviderWrapperOptions = {}) {
  // ... complex dependency management ...
  
  return {
    ...appConfigProvider,
    ...userProvider,
    SessionProviderWrapper: composeWrapper,
    sessionContext,
  };
}
```

### New Pattern (Simple)

```tsx
export type SessionProviderWrapperOptions = GenericWrapperOptions<
  typeof SessionProvider,
  typeof SessionContext
>;

function makeSessionProviderWrapper(options: SessionProviderWrapperOptions = {}) {
  const [wrapper, context] = makeGenericProviderWrapper(
    SessionProvider,
    SessionContext,
    options
  );

  return {
    wrapper,
    context,
  };
}
```

## How to Migrate Your Tests

### Pattern 1: Simple Provider Usage

**Before:**
```tsx
import { makeUserProviderWrapper } from '@test/providers';

const { UserProviderWrapper } = makeUserProviderWrapper();
const { result } = renderHook(() => useChat({ signal: mockSignal }), {
  wrapper: UserProviderWrapper,
});
```

**After:**
```tsx
import { makeTestProvider, providers } from '@test/providers';

const { wrapper } = makeTestProvider([providers.User]);
const { result } = renderHook(() => useChat({ signal: mockSignal }), {
  wrapper,
});
```

### Pattern 2: Provider with Options

**Before:**
```tsx
import { makeUserProviderWrapper } from '@test/providers';

const { UserProviderWrapper } = makeUserProviderWrapper({
  userContext: {
    __interceptor: (context) => {
      context!.user.defaultSettings.name = 'Local User';
    },
  },
});
```

**After:**
```tsx
import { makeTestProvider, providers } from '@test/providers';

const { wrapper } = makeTestProvider([providers.User], {
  userContext: {
    __interceptor: (context) => {
      context!.user.defaultSettings.name = 'Local User';
    },
  },
});
```

### Pattern 3: Nested Providers (Session includes AppConfig + User)

**Before:**
```tsx
import { makeSessionProviderWrapper } from '@test/providers';

const { SessionProviderWrapper } = makeSessionProviderWrapper({
  sessionContext: { ... },
  userContext: { ... },
  appConfigContext: { ... },
});
```

**After:**
```tsx
import { makeTestProvider, providers } from '@test/providers';

const { wrapper } = makeTestProvider(
  [providers.AppConfig, providers.User, providers.Session],
  {
    sessionContext: { ... },
    userContext: { ... },
    appConfigContext: { ... },
  }
);
```

### Pattern 4: Publisher Provider (includes AppConfig + User + Session)

**Before:**
```tsx
import { makePublisherProviderWrapper } from '@test/providers';

const { PublisherProviderWrapper } = makePublisherProviderWrapper({
  publisherContext: { initialValue: { ... } },
  sessionContext: { ... },
  userContext: { ... },
  appConfigContext: { ... },
});
```

**After:**
```tsx
import { makeTestProvider, providers } from '@test/providers';

const { wrapper } = makeTestProvider(
  [providers.AppConfig, providers.User, providers.Session, providers.Publisher],
  {
    publisherContext: { initialValue: { ... } },
    sessionContext: { ... },
    userContext: { ... },
    appConfigContext: { ... },
  }
);
```

### Pattern 5: Background Publisher (includes all above + Publisher)

**Before:**
```tsx
import { makeBackgroundPublisherProviderWrapper } from '@test/providers';

const { BackgroundPublisherProviderWrapper } = makeBackgroundPublisherProviderWrapper({
  backgroundPublisherContext: { ... },
  publisherContext: { ... },
  // ... other options
});
```

**After:**
```tsx
import { makeTestProvider, providers } from '@test/providers';

const { wrapper } = makeTestProvider(
  [
    providers.AppConfig,
    providers.User,
    providers.Session,
    providers.Publisher,
    providers.BackgroundPublisher,
  ],
  {
    backgroundPublisherContext: { ... },
    publisherContext: { ... },
    // ... other options
  }
);
```

### Pattern 6: Custom Render Function

**Before:**
```tsx
function render(ui: ReactElement, { appConfigOptions }: AppConfigProviderWrapperOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.AppConfig], { appConfigOptions });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
```

**After:**
```tsx
function render(ui: ReactElement, options: AppConfigProviderWrapperOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.AppConfig], options);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
```

## Provider Dependencies

The `makeTestProvider` automatically handles these dependencies:

- `AppConfig` → (no dependencies)
- `User` → (no dependencies)
- `Session` → requires `AppConfig`, `User`
- `Publisher` → requires `AppConfig`, `User`, `Session`
- `BackgroundPublisher` → requires `AppConfig`, `User`, `Session`, `Publisher`
- `PreviewPublisher` → requires `AppConfig`, `User`
- `AudioOutput` → (no dependencies)

## Key Changes in Options

Options are now passed directly to `makeTestProvider` without a `value` wrapper:

**Before (with individual makers):**
```tsx
makeUserProviderWrapper({
  userContext: {
    __interceptor: (context) => { ... },
  }
})
```

**After (with makeTestProvider):**
```tsx
makeTestProvider([providers.User], {
  userContext: {
    __interceptor: (context) => { ... },
  }
})
```

## Test Files Already Migrated

✅ [ArchivingButton.spec.tsx](frontend/src/components/MeetingRoom/ArchivingButton/ArchivingButton.spec.tsx)
✅ [useChat.spec.tsx](frontend/src/hooks/tests/useChat.spec.tsx)
✅ [useScreenShare.spec.tsx](frontend/src/hooks/tests/useScreenShare.spec.tsx)
✅ [InputAudioDevices.spec.tsx](frontend/src/components/MeetingRoom/InputAudioDevices/InputAudioDevices.spec.tsx)
✅ [BackgroundEffectOptions.spec.tsx](frontend/src/components/BackgroundEffects/BackgroundEffectOptions/BackgroundEffectOptions.spec.tsx)

## Test Files Needing Migration

Run this command to find all test files still using the old pattern:

```bash
grep -r "makeUserProviderWrapper\|makeSessionProviderWrapper\|makePublisherProviderWrapper\|makeAudioOutputProviderWrapper\|makePreviewPublisherProviderWrapper\|makeBackgroundPublisherProviderWrapper" frontend/src --include="*.spec.tsx" -l
```

## Migration Checklist

For each test file:

1. ✅ Update imports to use `makeTestProvider` and `providers`
2. ✅ Replace `makeXProviderWrapper()` calls with `makeTestProvider([providers.X])`
3. ✅ Specify all required dependencies in the providers array
4. ✅ Pass options directly (no `value` wrapper needed)
5. ✅ Replace `XProviderWrapper` with `wrapper`
6. ✅ Update custom render functions to pass options directly

## Notes

- The `makeTestProvider` will validate dependencies and throw errors if they're missing
- Provider order in the array matters for composition (they wrap in order)
- Context getters are now returned directly from `makeTestProvider` (e.g., `userContext`, `sessionContext`)
