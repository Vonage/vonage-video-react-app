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

## Local setup

The Kiro and VS Code MCP configurations use `.kiro/scripts/codegraph.sh`.
Install [uv](https://docs.astral.sh/uv/getting-started/installation/) on PATH and restart your editor.
The launcher uses `uvx` to provision Python 3.13, CodeGraphContext 0.6.13, and Kuzu 0.11.3 automatically.
No manually created virtualenv or developer-specific path is required. The first launch needs network access.
Commit the MCP settings, `.kiro/scripts/codegraph.sh`, this guide, and the graph entry in `.gitignore` together
so everyone who clones the repository gets the same configuration.
The graph is stored in `.codegraphcontext/graph.kuzu` inside this repository and is ignored by Git.
Never commit personal absolute paths in MCP settings. After moving or cloning a repository,
rebuild its graph so indexed source paths match the new checkout.
Use the MCP indexing tools while the server is connected. With the server disconnected,
run `sh .kiro/scripts/codegraph.sh index .` to index or refresh this checkout.
Kiro and VS Code must not open this embedded database simultaneously; disconnect the server
in one editor before connecting it in the other. Open each repository as its own Kiro workspace.
