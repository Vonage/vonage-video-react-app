---
name: feature-flag
description: Add, rename or remove a configuration key / feature flag in the Vonage Video React reference app (VERA web) end-to-end — app-config.json, the shared JSON schema in specs/, scripts/generateEnv.ts, env.sh, the appEnvKeys allow-list in frontend/vite.config.ts, the zod schema in frontend/src/env.ts, the component that reads it, its spec, frontend/.env.example and docs. Use whenever the user wants a new toggle ("make X configurable", "add a flag to hide Y"), a new default value, or touches generateEnv.ts, env.ts or the app-config schema. For flipping a key that already exists use the configure guide instead.
inclusion: fileMatch
fileMatchPattern: ['scripts/generateEnv.ts', 'frontend/src/env.ts', 'specs/app-config.schema.json']
---

# Adding a config key to VERA Web

In kiro this attaches when the generator, `env.ts` or the schema is in context; pull it in with `#vera-feature-flags` otherwise. Flipping an existing key is `/configure` (Claude Code) or `#vera-configure` (kiro).

A value travels `app-config.json` → `yarn sync:env` → `env.sh` → `source env.sh` → `frontend/vite.config.ts` (`appEnvKeys` → `__APP_ENV__`) → `frontend/src/env.ts` (`Env`) → `env.MY_FLAG` in a component. **Every hop is an explicit list.** Miss one and the value silently falls back to the default in `env.ts`, which is the most common way a new flag "does nothing".

Worked example: a boolean `meetingRoomSettings.allowRaiseHand` → `ALLOW_RAISE_HAND`, default `true`.

## 1. Decide where it lives

- **Boolean toggle, cross-platform meaning** → a property in the matching `*Settings` group of `app-config.json`. The shared schema allows extra **boolean** keys in every `*Settings` group (`additionalProperties: { "type": "boolean" }`), so it validates even before step 2.
- **String / number / list, or a new group** → must be declared in `specs/app-config.schema.json` first, otherwise the file stops validating.
- **Web-only non-boolean tuning value** (like `NOTIFICATION_DURATION_MS`) → not in `app-config.json`; emit a `literal` entry in `scripts/generateEnv.ts`.
- **Per-environment value** (URLs, hosts) → not in `app-config.json`; it is read from `frontend/.env` or the shell (`API_URL`, `TUNNEL_DOMAIN`, `VONAGE_VIDEO_HOST`). Skip steps 3–4 for those.

## 2. `app-config.json` and the shared schema

```jsonc
// app-config.json → meetingRoomSettings
"allowRaiseHand": true
```

Document it in `specs/app-config.schema.json` under the same group: `"type"`, a one-line `"description"`, and `"x-envVar": "ALLOW_RAISE_HAND"`. Add it to `"required"` only if every platform's config will have it.

**This schema is shared with the mobile apps** — the Android repo's CI and its config TUI download `specs/app-config.schema.json` (and `theme.schema.json`) from this repo's `develop` branch. Adding a required key or tightening a type breaks their config validation until they follow. Additive, optional booleans are safe.

## 3. Generator: `scripts/generateEnv.ts`

Add an entry to `envVariables` (array order = order of exports in `env.sh`; put it near its group):

```ts
{ name: 'ALLOW_RAISE_HAND', sourcePath: 'meetingRoomSettings.allowRaiseHand', format: 'raw' },
```

`format: 'raw'` for booleans/numbers, `'string'` for single-quoted strings, `join: '|'` for arrays, `valueMap` when the shared enum differs from the web value (see `DEFAULT_LAYOUT_MODE`). A missing `sourcePath` makes the generator exit with `Missing value in app-config.json for path …`.

```bash
yarn sync:env
git diff env.sh
```

The diff must show only your new export. **`sync:env` also deletes the hand-maintained `AUTH_*` / `OIDC_*` block at the end of `env.sh`** — restore it (`git checkout -p env.sh`) before committing.

## 4. Allow-list: `frontend/vite.config.ts`

Add `'ALLOW_RAISE_HAND'` to `appEnvKeys`. Only listed keys are copied into `__APP_ENV__`; anything else in `env.sh` never reaches the browser. (Several documented values — `NOTIFICATION_DURATION_MS`, the bitrate bounds, `SUPPORTED_FRAME_RATES`, `PUBLISHER_MAX_RESOLUTION`, `ARCHIVES_REFRESH_INTERVAL_MS` — are missing from this list today and are therefore always their `env.ts` defaults.)

## 5. Parse it: `frontend/src/env.ts`

Two edits in the same file:

```ts
// EnvironmentVariablesSchema
ALLOW_RAISE_HAND: boolean({ default: true }),

// class Env
public ALLOW_RAISE_HAND!: boolean;
```

Use the existing field helpers (`boolean`, `integer`, `stringField`, `langListField`, `intListField`, `ResolutionSchema`). The default here is what unit tests, Storybook-without-env and any missing value get — make it the safe production behaviour.

## 6. Read it where it's used

```ts
import { env } from '<relative path>/env';

{env.ALLOW_RAISE_HAND && <RaiseHandButton ... />}
```

Follow the repo rules in `CLAUDE.md`: the **parent decides visibility** — gate the component where it's rendered; a reusable component must not read `env` and return `null`. Vera-specific flags stay in `frontend`; never import `env` into `libs/ui`, `libs/core` or `libs/common` (they are app-agnostic), pass a prop instead.

## 7. Test it

Vitest runs with `mode === 'test'`, so **no** env values are injected and `Env` defaults apply. Flip the flag per test; `frontend/src/test/setup.ts` calls `env.reset()` after each:

```ts
it('hides the raise-hand button when allowRaiseHand is false', () => {
  env.partialUpdate({ ALLOW_RAISE_HAND: false });
  render(<Toolbar />);
  expect(screen.queryByTestId('RaiseHandButton')).not.toBeInTheDocument();
});
```

One "off" case next to the existing "on" behaviour is enough (repo rule: avoid overtesting). Run it: `yarn test:frontend <path to spec>` (`/run-tests`, `#vera-testing`).

## 8. Document

- `frontend/.env.example` — add a commented `# ALLOW_RAISE_HAND=true` line in the matching block.
- `docs/CONFIGURATION.md` — add a row to the matching table (variable, type, default, values, description).

## Renaming or removing

Do the same hops in reverse and grep both names across `app-config.json specs scripts frontend docs integration-tests`. Removing a key from `app-config.json` while the generator still maps it fails `yarn sync:env` loudly — good. Removing it only from `appEnvKeys` fails silently — bad; grep.

## Done checklist

- [ ] `app-config.json` value, schema entry with `x-envVar`
- [ ] `generateEnv.ts` entry; `yarn sync:env`; `env.sh` diff is one line; OIDC block intact
- [ ] `appEnvKeys` in `frontend/vite.config.ts`
- [ ] `EnvironmentVariablesSchema` **and** class field in `env.ts`
- [ ] consumer gated by the parent; spec with `env.partialUpdate`
- [ ] `.env.example` + `docs/CONFIGURATION.md`
- [ ] restarted `yarn dev` and saw it work with the flag both ways (toggle via `frontend/.env` for a quick check)
- [ ] `yarn quality-check frontend` passes
