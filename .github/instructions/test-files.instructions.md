---
applyTo: "**/*.{spec,test}.{ts,tsx}"
---

# Test Authoring Instructions

These rules now live in the shared agent instructions, so that every assistant loads them and not
only Copilot. This file remains so Copilot still scopes them to test files.

See the **Test Authoring** section of [AGENTS.md](../../AGENTS.md), which covers testing philosophy,
what to mock, mocking rules, provider and global-store testing, async test rules, shared helpers and
banned boilerplate.
