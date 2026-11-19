---
name: run-tests
description: Find and run the right tests in the Vonage Video React reference app (VERA web) with pnpm — which command runs which file (Vitest for frontend, backend and libs; Playwright for end-to-end and sign-in tests), how to run one file, watch/debug/coverage, what the git hooks and CI check, and why a test passes locally but fails in CI. Use when someone asks how to run, debug or fix a test, edits a *.spec.ts(x) or *.test.ts(x) file, a git hook fails, or wants to know what CI checks before a pull request.
inclusion: fileMatch
fileMatchPattern: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx']
---

# Running tests in VERA Web

In kiro this loads by itself when a test file is open; otherwise use `#vera-testing`. For screenshot tests see `/record-snapshots` (`#vera-snapshot-tests`).

Run the smallest test that proves your change. One file takes seconds.

## Which command

| Your file is in | One file | Everything there |
|---|---|---|
| `frontend/src/` | `pnpm test:frontend <file path or name>` | `pnpm test:frontend` |
| `backend/` | `pnpm test:backend tests/session.test.ts` | `pnpm nx test backend` |
| `libs/ui/` | `pnpm nx test ui <file name>` | `pnpm nx test ui` |
| `libs/core/` | `pnpm nx test core <file name>` | `pnpm nx test core` |
| `libs/common/` | `pnpm nx test common <file name>` | `pnpm nx test common` |
| `libs/api/` | `pnpm nx test api <file name>` | `pnpm nx test api` |
| `integration-tests/tests/` | `pnpm test:integration chat.spec.ts` (opens Chrome) | `pnpm test:integration playwright` |
| `integration-tests/tests-auth/` | — | `pnpm test:integration auth` |
| `integration-tests/test-api/` | — | `pnpm test:integration api` |

- **Backend:** give the path **from inside `backend/`** (`tests/health.test.ts`). A path starting with `backend/` finds no tests, and a bare name like `health` is rejected.
- **Libs:** a file name (`tryCatch`) or a path from inside the lib (`src/execution/tryCatch`) both work. A path starting with `libs/…` finds no tests.
- **Frontend:** any form works.
- Watch mode and debugging: `pnpm test:frontend watch <path>`, `pnpm test:backend watch <path>`, `pnpm test:backend debug <path>` (then attach VS Code).
- All unit tests at once: `pnpm test`.

## Good to know

- **Unit tests ignore your settings.** They always use the defaults in `frontend/src/env.ts`. To test a flag, call `env.partialUpdate({ ALLOW_CHAT: false })` in the test; it resets after each test.
- **Backend tests** run one file at a time and use Vitest (not Jest any more): `vi.fn()`, `vi.mock()`.
- **End-to-end tests** (`pnpm test:integration`) need real Vonage credentials in `backend/.env`. Set `AUTH_ENABLED='false'` there first, otherwise every page goes to the login screen and the tests fail.
- **Start the app yourself first:** run `pnpm start` in another terminal, then the tests. Playwright reuses it, and its own auto-start still calls yarn. `pnpm start` serves a build, so restart it after changing frontend code.
- **Sign-in tests** (`pnpm test:integration auth`) need the sign-in settings in your shell or in `integration-tests/auth/backend.env` (not committed). Copy the values from the `auth-e2e` job in `.github/workflows/run-tests.yml` and add an `AUTH_COOKIE_SECRET` from `pnpm generate:secret`. This suite always starts its own app and still does that with yarn (see "Known gap" in `/setup`).
- End-to-end tests use real video sessions with fake camera and mic. They're slower and sometimes flaky; CI retries them twice.

## Writing tests (checked in review)

Full rules: `.github/instructions/test-files.instructions.md`. In short:

- Don't over-test. One good test of the real behaviour beats many small variations.
- Only mock outside things (the Vonage SDK, browser APIs). Don't mock our own contexts, hooks or components; use `makeTestProvider`.
- Use `vi.mocked(...)`. Casting with `as Mocked<...>` is not allowed.
- No `toMatchSnapshot`. The only exception is Playwright screenshots.
- File names are camelCase. Put tests next to the code.

## What runs automatically

| When | What runs | Run it yourself with |
|---|---|---|
| Before a commit | type check, lint, formatting check | `pnpm nx run-many -t ts-check`, `pnpm lint`, `pnpm prettier . --check` (fix: `pnpm lint:fix`) |
| Before a push | all unit tests + `libs/common` hash check | `pnpm test`, `pnpm nx run common:hash:check` |
| Pull request CI | unit tests for every project, end-to-end on Chrome, Firefox and Mobile Chrome, sign-in tests, lint, types, formatting, file names, licences | same as above |

To check only one project: `pnpm nx run-many -t ts-check -p frontend` or `pnpm lint:fix frontend`.

## Works locally, fails in CI

1. **Screenshot test fails** → `/record-snapshots`.
2. **Fails only in Firefox or Mobile Chrome** → you probably only ran Chrome. Try `cd integration-tests && npx playwright test <spec> --project=firefox`.
3. **Hash check fails** → you changed `libs/common`. Merge the latest `develop`, run `pnpm nx run common:hash:update`, commit `libs/common/manifest.json`.
4. **End-to-end tests skipped on a fork** → normal. They need repo secrets.
