# Frontend Coverage Summary Generator

This script regenerates `FRONTEND_TEST_COVERAGE_SUMMARY.md` from repository sources.

## Script

- `scripts/generateFrontendCoverageSummary.mjs`

## What it scans

- `frontend/src/hooks`
- `frontend/src/api`
- `integration-tests/tests`
- `integration-tests/playwright.config.ts`

## Output

By default it writes:

- `FRONTEND_TEST_COVERAGE_SUMMARY.md`

You can pass a custom output path as the first argument.

## Run

```bash
yarn generate:frontend-coverage-summary
```

```bash
node scripts/generateFrontendCoverageSummary.mjs FRONTEND_TEST_COVERAGE_SUMMARY.md
```

## Notes

- Coverage mapping is static and heuristic.
- Use it as a regression signal, not a runtime coverage truth.

