---
inclusion: always
---

# Code graph navigation

Use CodeGraphContext before broad repository exploration:

1. Locate relevant symbols and files with a narrow, path-scoped graph query.
2. Inspect callers, callees, imports, and inheritance only when those relationships matter to the task.
3. Read the smallest relevant source ranges after the graph identifies them.
4. Treat dead-code and relationship results as candidates that require verification in source and tests.

This is one monorepo graph. Use the `frontend/`, `backend/`, `integration-tests/`, and `libs/*/` paths to distinguish projects while preserving cross-project relationships.
