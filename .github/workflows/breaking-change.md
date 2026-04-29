---
on:
  workflow_dispatch:
  pull_request:
    types: [opened, synchronize]
    paths:
      - "package.json"
      - "package-lock.json"
      - "yarn.lock"
      - "pnpm-lock.yaml"

engine: copilot

tools:
  github:
    toolsets: [pull_requests, issues]
  web-fetch:
  web-search:

secrets:
  COPILOT_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
---

# Breaking Change Detector

A pull request has been opened or updated that modifies one or more dependency files.

## Your Task

### Step 1 - Identify changed packages

- Read the diff of package.json in PR number ${{ github.event.pull_request.number }}.
- List every package whose version has changed (added, removed, or bumped).
- For each package, note the old version and the new version.

### Step 2 - Classify the version bump

For each changed package, determine the type of version bump:
- Major (e.g. 1.x.x to 2.x.x) - highest risk of breaking changes
- Minor (e.g. 1.2.x to 1.3.x) - may include deprecations
- Patch (e.g. 1.2.3 to 1.2.4) - usually safe

### Step 3 - Research breaking changes

For each package with a major or minor bump:
- Search the web for the package changelog or release notes between the old and new versions.
- Look specifically for:
  - Removed or renamed exports or APIs
  - Changed function signatures or return types
  - Dropped Node.js or browser version support
  - Behavior changes that could silently break existing code
  - Migration guides or codemods mentioned

### Step 4 - Post a PR comment

Post a comment on PR number ${{ github.event.pull_request.number }} with:
- A table listing each changed package, old version, new version, bump type, and whether breaking changes were found
- For each package with breaking changes: what changed, the impact, and migration steps
- A list of safe updates with no detected breaking changes

## Style and Guardrails

- Be concise and developer-friendly.
- If you cannot find changelog information for a package, say so explicitly rather than guessing.
- Do not modify any files in the repository - only post a comment.
- If no dependency files were actually changed in the diff, post a short comment saying no dependency changes were detected and exit.
