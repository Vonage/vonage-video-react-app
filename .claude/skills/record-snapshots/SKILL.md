---
name: record-snapshots
description: Record, update, verify and review Playwright visual-comparison baselines (toHaveScreenshot) in the Vonage Video React reference app (VERA web). Use whenever a UI or theme change makes "Screenshot comparison failed" / "toHaveScreenshot" fail locally or in CI, the user asks to update or regenerate screenshots, golden or baseline images, adds a new screenshot assertion, or sees *-snapshots/*.png files in a diff.
inclusion: fileMatch
fileMatchPattern: ['integration-tests/tests/**']
---

# Visual baselines in VERA Web

In kiro this attaches when a file under `integration-tests/tests/` is in context; pull it in with `#vera-snapshot-tests` otherwise. For running tests in general: `/run-tests` in Claude Code, `#vera-testing` in kiro.

Screenshot assertions are the **only** snapshot-style tests allowed in this repo (`.github/instructions/test-files.instructions.md` bans `toMatchSnapshot` in unit tests). They live in the Playwright suite.

## Where baselines live and how they are named

- Specs with screenshots: `integration-tests/tests/visualComparisons.spec.ts` (landing, waiting room, unsupported browser) and `integration-tests/tests/multiparty.spec.ts` (layout states).
- Baselines: `<spec>.ts-snapshots/<name>-<project>-<platform>.png`, e.g. `Landing-page-UI-test-1-firefox-darwin.png`. Three projects: `Google-Chrome-Fake-Devices`, `firefox`, `Mobile-Chrome`.
- **Only `-darwin` baselines are committed, and CI uses them too.** `playwright.config.ts` takes the platform suffix from `PLAYWRIGHT_SNAPSHOT_PLATFORM` (falls back to the OS), and `run-tests.yml` sets it to `darwin` on its Ubuntu runners. Cross-OS font rendering differences are absorbed by `SCREENSHOT.MAX_DIFF_PIXEL_RATIO = 0.3` in `integration-tests/tests/utils.ts` plus Chromium font flags.
- On Linux locally, a run without the variable looks for `-linux` files that don't exist and **writes new ones** instead of comparing. Set `PLAYWRIGHT_SNAPSHOT_PLATFORM=darwin` there, and never commit `-linux`/`-win32` PNGs.
- Volatile regions are masked (`[data-testid="app-version"]` in the footer). If your change adds a timestamp, room name or anything random to a captured page, mask it rather than accepting a flaky baseline.

## Verify (no writes)

```bash
yarn test:integration playwright          # whole Playwright suite, all three projects
cd integration-tests && npx playwright test tests/visualComparisons.spec.ts --project=firefox
```

The Playwright `webServer` builds and serves the app with `yarn start` on `:3345` (or reuses one already running — **restart it after UI changes**, it serves a build). Real `backend/.env` credentials are required; the multiparty spec joins real sessions.

On failure, open the HTML report: `cd integration-tests && npx playwright show-report`. It shows expected / actual / diff side by side — look at it before deciding the change is intended.

## Record / update

Only after you've confirmed the visual change is intended:

```bash
yarn test:integration update                                   # both visual specs, all three projects
yarn test:integration update tests/visualComparisons.spec.ts   # one spec
```

`update` runs `playwright test <spec(s)> --project='Google Chrome Fake Devices' --project=firefox --project='Mobile Chrome' --update-snapshots`. Then:

1. Re-run in verify mode — it must pass twice in a row; a baseline that only passes once is capturing animation or loading state.
2. `git status integration-tests/` — expect changed `*-darwin.png` only, for the screens you touched. Unrelated screens changing means fonts, viewport or a stale build, not your change.
3. Review every image (the GitHub PR diff has a swipe/onion-skin view) and say in the PR which screens changed and why.

`yarn test:integration canon [spec]` runs Chrome only without updating; it is handy to regenerate a deleted Chrome baseline quickly but leaves Firefox/Mobile Chrome untouched — prefer `update`.

## Adding a screenshot assertion

```ts
await expect(page).toHaveScreenshot({
  mask: [page.locator('[data-testid="app-version"]')],
  maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
});
```

Wait for the page to be visually stable first (fonts loaded, video tiles playing, no open tooltips). Then `yarn test:integration update <your spec>` to create the baselines for all three projects and commit them with the spec. If the new spec file has screenshots, add it to `VISUAL_COMPARISON_SPEC_FILES` in `scripts/testIntegration.ts` so a bare `yarn test:integration update` covers it.

## Cautions

- Theme changes (`theme.json` → `yarn sync:theme-tokens`) and copy changes in `frontend/src/locales` legitimately move many baselines at once; regenerate them in the same PR.
- `docs/TESTING.md` mentions an `update-screenshots` PR label that regenerates baselines in CI; no such workflow exists in `.github/workflows/` today. Record locally on macOS.
- Don't raise `MAX_DIFF_PIXEL_RATIO` to make a failure go away; it's already permissive, so a failure above it is a real visual change.
