---
name: run-tests
description: Pick and run the right tests in the Vonage Video React reference app (VERA web) — which yarn script runs which file (Vitest for frontend and libs, Jest for backend, Playwright and Jest API tests for integration-tests), running a single spec, watch/debug/coverage modes, what the pre-commit/pre-push hooks and CI run, and why a test passes locally but fails in CI. Use whenever the user asks how to run, debug or fix a test, edits a *.spec.ts(x) or *.test.ts(x) file, sees the pre-push hook fail, or wants to know what CI will check before opening a PR.
inclusion: fileMatch
fileMatchPattern: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx']
---

# Running tests in VERA Web

In kiro this attaches when a test file is in context; pull it in with `#vera-testing` otherwise. Visual baselines are a separate procedure: `/record-snapshots` in Claude Code, `#vera-snapshot-tests` in kiro.

Run the narrowest thing that proves the change. A single spec takes seconds; `yarn test` runs six suites and the integration suite needs real Vonage credentials and a built app.

## File → command

| File lives in | Runner | One file | Whole project |
|---|---|---|---|
| `frontend/src/**` (`*.spec.tsx`, some `*.test.ts`) | Vitest + jsdom + RTL | `yarn test:frontend frontend/src/components/Foo/Foo.spec.tsx` | `yarn test:frontend` |
| `libs/ui/**` | Vitest | `yarn test:ui <path or name>` | `yarn test:ui` |
| `libs/core/**` | Vitest | `yarn test:core <path or name>` | `yarn test:core` |
| `libs/common/**` (`src`, `web`, `node`) | Vitest | `yarn test:common <path or name>` | `yarn test:common` |
| `libs/api/**` | Vitest | `yarn test:api <path or name>` | `yarn test:api` |
| `backend/**` (`*.test.ts`) | Jest (`--maxWorkers=1`, ESM via `--experimental-vm-modules`) | `yarn test:backend backend/tests/session.test.ts` | `yarn test:backend` |
| `integration-tests/tests/*.spec.ts` | Playwright | `yarn test:integration chat.spec.ts` (headed Chrome) | `yarn test:integration playwright` |
| `integration-tests/test-api/*` | Jest; boots `backend/server.ts` in-process on a random port and drives it through `libs/api`'s client | `yarn test:integration api` | same |

Modes (first argument): `watch`, `coverage`, and for frontend/backend also `debug` (Node `--inspect-brk`; attach VS Code). Examples: `yarn test:frontend watch frontend/src/hooks`, `yarn test:backend debug backend/tests/health.test.ts`, `yarn test:ui coverage`.

`yarn nx test <project>` works too (projects: `frontend`, `backend`, `ui`, `core`, `common`, `api`); the `yarn test:*` wrappers add `source env.sh`, path filtering and the modes.

## Things that surprise people

- **Config is ignored in unit tests.** Vitest runs in `mode === 'test'`, so no `env.sh`/`frontend/.env` values reach `env`; `frontend/src/env.ts` defaults apply. Flip flags per test with `env.partialUpdate({ ALLOW_CHAT: false })` — `frontend/src/test/setup.ts` calls `env.reset()` after each test.
- **Single-file frontend runs bail on first failure** (`--bail=1`) and print verbose output; the full run uses the dot reporter.
- **The frontend coverage report includes the libs** (`libs/common`, `libs/core`, `libs/ui` sources are in its coverage `include`), so a lib change can move frontend coverage in Sonar.
- **Backend tests run serially** (`--maxWorkers=1` in `backend/project.json`) and source `env.sh` first. Keep it that way unless you've proven the suites are independent.
- **Integration tests start the app themselves.** `playwright.config.ts` has a `webServer` that runs `yarn start` (build + bundled backend on `http://127.0.0.1:3345`) and reuses one that is already up. So `backend/.env` must hold real credentials, and the first run spends a minute or two building. Keep `yarn start` running in another terminal to iterate faster — but it serves a **build**, so restart it after frontend changes. `debug`/`inspect` modes use `yarn dev` on `:5173` instead, which picks up changes live.
- **Integration tests create real Video API sessions** with fake media (Chrome fake devices, a WAV file for audio). They are slower and flakier than unit tests; CI retries twice.

## Writing tests (repo rules, enforced in review)

Full guide: `.github/instructions/test-files.instructions.md`. The short version:

- Don't overtest; one high-value behavioural test beats input permutations.
- Mock only third-party SDKs and browser APIs (`@vonage/client-sdk-video`, `navigator.mediaDevices`). Don't mock our own contexts, hooks or components; build them with `makeTestProvider`.
- Use `vi.mocked(...)`; `as Mocked<...>` casts are banned.
- No snapshot tests (`toMatchSnapshot`). Playwright `toHaveScreenshot` in integration tests is the only exception.
- File names are camelCase (CI's filename lint), tests sit next to the code they test.

## What runs automatically

| When | Runs | Fix locally with |
|---|---|---|
| `git commit` (husky pre-commit) | `yarn quality-check` = `ts-check` + ESLint + Prettier check | `yarn lint:fix`, then `yarn ts-check` |
| `git push` (husky pre-push) | `yarn test` (all unit suites except integration) + `yarn nx run common:hash:check` | the failing suite's command above; `yarn common:hash:update` for the hash |
| PR CI `run-tests.yml` | `nx test <project> --configuration=coverage` for frontend, backend, ui, core, common, api; Playwright on Chrome (fake devices), Firefox, Mobile Chrome; SonarCloud | — |
| PR CI `lint.yml` | `yarn lint`, `yarn prettier . --check`, `yarn ts-check`, camelCase filenames, license check | `yarn quality-check` |
| PR CI `video-common-integrity.yml` | `common:build` + `common:hash:check` | `yarn common:hash:update` |

Scope the static checks to one project while iterating: `yarn quality-check frontend`, `yarn ts-check backend`, `yarn lint:fix ui`.

## Passes locally, fails in CI

1. **Screenshot mismatch** — baselines are per browser; see `/record-snapshots` / `#vera-snapshot-tests`.
2. **Firefox or Mobile Chrome only** — locally you probably ran only Chrome; rerun with `cd integration-tests && npx playwright test <spec> --project=firefox`.
3. **Hash check** — `libs/common/src` changed without `yarn common:hash:update`, or the branch is behind `develop` (merge it first, then update the hash).
4. **Unit test depends on your `frontend/.env`** — it shouldn't be able to (test mode ignores env); check for code reading `import.meta.env` or `process.env` directly instead of `env`.
5. **Integration tests skipped on your fork PR** — expected; the E2E job only runs for branches in the main repo (it needs secrets).
