# Code Style

This document covers the project's linting, formatting, naming conventions, and documentation generation setup.

## Linting and Auto-Formatting

The project uses **ESLint** and **Prettier** to enforce consistent code style. Prettier issues are surfaced through ESLint via `eslint-plugin-prettier`, so all style feedback appears in a single tool.

### Editor Setup

Install the VSCode ESLint extension:

- Extension ID: `dbaeumer.vscode-eslint`

You can configure VSCode to fix ESLint issues on save, or fix them manually using the command palette:

```
Cmd + Shift + P > "ESLint: Fix all auto-fixable problems"
```

### Terminal Commands

| Command | Description |
|---------|-------------|
| `yarn lint` | Check for ESLint issues |
| `yarn lint:fix` | Fix auto-fixable issues and run Prettier on all files |

## File Names

All filenames in the project use `camelCase`.

## Documentation Generation

The project uses [typedoc](https://typedoc.org/) to generate documentation from JSDoc comments in the source code.

| Command | Description |
|---------|-------------|
| `yarn nx run frontend:docs` | Generate documentation |

Generated documents are output to the `frontend/dist` folder.

---

## Related Documentation

- [Contributing](./CONTRIBUTING.md) — Contribution workflow and guidelines
