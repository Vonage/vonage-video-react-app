---
name: feature-flag
description: Add, rename or remove a setting / feature flag in the Vonage Video React reference app (VERA web), from start to end — app-config.json, the shared schema in specs/, scripts/generateEnv.ts, env.sh, env.defaults.sh, appEnvKeys in frontend/vite.config.ts, frontend/src/env.ts, the component that uses it, its test, frontend/.env.example and docs. Use when someone wants a new on/off switch ("make X configurable", "add a flag to hide Y"), a new default value, or edits generateEnv.ts, env.ts or the app-config schema. To change a setting that already exists, use the configure guide.
inclusion: fileMatch
fileMatchPattern: ['scripts/generateEnv.ts', 'frontend/src/env.ts', 'specs/app-config.schema.json']
---

# Adding a setting to VERA Web

In kiro this loads by itself when one of those files is open; otherwise use `#vera-feature-flags`. To change an existing setting, use `/configure` (`#vera-configure`).

A setting passes through **five places**, and each one has its own list. Forget one and the app quietly uses the default — the most common reason a new flag "does nothing".

Example used below: an on/off switch `meetingRoomSettings.allowRaiseHand`, named `ALLOW_RAISE_HAND`, on by default.

## 1. Pick where it goes

- **On/off switch** → add it to the right `…Settings` group in `app-config.json`. The shared schema already allows extra on/off keys there.
- **Text, number or list** → first add it to `specs/app-config.schema.json`, or the file won't validate.
- **Web-only number or text** (like `NOTIFICATION_DURATION_MS`) → put it in `env.defaults.sh` instead: `export NAME="${NAME:-default}"`, with a one-line comment. Public values only. Skip step 3, but still do steps 4 and 5.
- **Per-machine value** (URLs, hosts) → it belongs in `frontend/.env`, not `app-config.json`. Skip step 3.

## 2. `app-config.json` and the schema

```jsonc
// app-config.json, inside meetingRoomSettings
"allowRaiseHand": true
```

In `specs/app-config.schema.json`, under the same group, add `"type"`, a short `"description"` and `"x-envVar": "ALLOW_RAISE_HAND"`.

The Android repo also checks its config against this schema (from `develop`). Adding an optional on/off key is safe. Making a key required, or changing a type, breaks their checks until they update.

## 3. `scripts/generateEnv.ts`

Add a line to the matching group in `envVariableGroups`:

```ts
{ name: 'ALLOW_RAISE_HAND', sourcePath: 'meetingRoomSettings.allowRaiseHand', format: 'raw' },
```

Use `format: 'raw'` for true/false and numbers, `'string'` for text, `join: '|'` for lists. Then:

```bash
pnpm sync:env
git diff env.sh      # should show only your new line
```

## 4. `frontend/vite.config.ts`

Add `'ALLOW_RAISE_HAND'` to `appEnvKeys`. Only names in this list reach the browser.

## 5. `frontend/src/env.ts`

Two changes in the same file:

```ts
// in EnvironmentVariablesSchema
ALLOW_RAISE_HAND: boolean({ default: true }),

// in class Env
public ALLOW_RAISE_HAND!: boolean;
```

The default is what tests and missing values get, so make it the safe choice.

## 6. Use it

```tsx
import { env } from '<relative path>/env';

{env.ALLOW_RAISE_HAND && <RaiseHandButton />}
```

Repo rules (`CLAUDE.md`):

- The **parent** decides whether to show a component. Don't make the component return `null` itself.
- Only `frontend` reads `env`. Never import it into `libs/ui`, `libs/core` or `libs/common`; pass a prop instead.

## 7. Test it

Tests always use the defaults from `env.ts`. Turn the flag off inside the test (it's reset after each test):

```tsx
it('hides the raise-hand button when allowRaiseHand is false', () => {
  env.partialUpdate({ ALLOW_RAISE_HAND: false });
  render(<Toolbar />);
  expect(screen.queryByTestId('RaiseHandButton')).not.toBeInTheDocument();
});
```

One "off" test is enough. Run it with `pnpm test:frontend <path to the test file>`.

## 8. Document it

- `frontend/.env.example`: add a commented line, `# ALLOW_RAISE_HAND=true`.
- `docs/CONFIGURATION.md`: add a row to the right table.

## Renaming or removing

Do the same steps backwards, then search for the old name in `app-config.json`, `specs`, `scripts`, `frontend`, `docs` and `integration-tests`.

## Checklist

- [ ] `app-config.json` + schema entry with `x-envVar`
- [ ] `generateEnv.ts` line (or `env.defaults.sh`), `pnpm sync:env`, one-line diff
- [ ] `appEnvKeys` in `frontend/vite.config.ts`
- [ ] schema **and** class field in `env.ts`
- [ ] parent decides visibility; one test with `env.partialUpdate`
- [ ] `.env.example` + `docs/CONFIGURATION.md`
- [ ] restarted `pnpm dev` and tried the flag both ways (quickest: set it in `frontend/.env`)
- [ ] `pnpm lint` and `pnpm nx run-many -t ts-check -p frontend` pass
