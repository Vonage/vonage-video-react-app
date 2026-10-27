---
name: record-snapshots
description: Update, check and review the Playwright screenshot tests (toHaveScreenshot) in the Vonage Video React reference app (VERA web). Use when a UI or theme change makes a screenshot test fail locally or in CI, someone asks to update or regenerate screenshots / baseline images, adds a new screenshot check, or sees *-snapshots/*.png files in a diff.
inclusion: fileMatch
fileMatchPattern: ['integration-tests/tests/**']
---

# Screenshot tests in VERA Web

In kiro this loads by itself for files in `integration-tests/tests/`; otherwise use `#vera-snapshot-tests`. For other tests see `/run-tests` (`#vera-testing`).

Screenshot checks are the only snapshot-style tests allowed in this repo.

## Where they are

- Tests with screenshots: `integration-tests/tests/visualComparisons.spec.ts` and `integration-tests/tests/multiparty.spec.ts`.
- Saved images sit next to them, in folders ending in `-snapshots`, e.g. `Landing-page-UI-test-1-firefox-darwin.png`. There is one image per browser: Chrome, Firefox and Mobile Chrome.
- **Only Mac (`-darwin`) images are saved, and CI compares against them too.** A test fails if more than **5%** of the pixels differ. Images made on Linux or Windows can be more than 5% off, so **create images on a Mac**.
- On Linux, set `PLAYWRIGHT_SNAPSHOT_PLATFORM=darwin` before running. Otherwise new `-linux` images are written instead of compared. Never commit `-linux` or `-win32` images.
- Parts of the page that change every time, like the app version, are hidden (`mask`). If your change adds a time or random text to the page, hide it the same way.

## Before you start

1. In `backend/.env`, use real Vonage credentials and set `AUTH_ENABLED='false'`. With auth on, every screenshot shows the login redirect.
2. Start the app in another terminal: `pnpm start`. It serves a build, so restart it after UI changes.

## Check

```bash
pnpm test:integration playwright                                          # all browsers
cd integration-tests && npx playwright test tests/visualComparisons.spec.ts --project=firefox
```

If something fails, look at the report: `cd integration-tests && npx playwright show-report`. It shows the old image, the new image and the difference. Decide whether the change is on purpose before updating anything.

## Update

Only when the change is on purpose:

```bash
pnpm test:integration update                                   # both screenshot files, all browsers
pnpm test:integration update tests/visualComparisons.spec.ts   # one file
```

Then:

1. Run the check again. It should pass **twice in a row**. If not, the screenshot is catching an animation or loading state.
2. `git status integration-tests/` should show only `-darwin.png` files for the screens you changed. Other screens changing means something else is wrong (fonts, old build).
3. Look at each image in the pull request and say which screens changed and why.

## Add a new screenshot check

```ts
await expect(page).toHaveScreenshot({
  mask: [page.locator('[data-testid="app-version"]')],
  maxDiffPixelRatio: SCREENSHOT.MAX_DIFF_PIXEL_RATIO,
});
```

Wait until the page is fully ready (fonts loaded, videos playing, no tooltips open). Then run `pnpm test:integration update <your spec>` and commit the new images with the test. If it's a new file, add it to `VISUAL_COMPARISON_SPEC_FILES` in `scripts/testIntegration.ts`.

## Remember

- Theme or text changes can change many screenshots at once. Update them in the same pull request.
- `docs/TESTING.md` mentions an `update-screenshots` label that updates images in CI. That doesn't exist; do it on a Mac.
- Don't raise the 5% limit to make a test pass. If the difference is only faint edges, the image was probably made on a non-Mac machine; make it again on a Mac.
