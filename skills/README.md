# Skills

Agent skills for this project, written in the open [Agent Skills](https://github.com/agentskills/agentskills)
format (`SKILL.md` with `name` + `description` front-matter). They are plain markdown, so they
work with any AI coding assistant that can read markdown-based instructions — Claude Code, Cursor,
Windsurf, GitHub Copilot, Kiro, or any other.

This folder is the **single source of truth**. It is intentionally IDE-agnostic and product-agnostic
so the skills remain valid even if the backend code they describe moves to a different repository.

## Available skills

Each skill is a folder under `skills/` with its own `SKILL.md`. New skills are added here — append a
row to the table below and drop the folder in. The rest of this document is skill-agnostic, so it
does not need editing when the catalog grows.

| Skill | Entry point | Scope |
| ----- | ----------- | ----- |
| `session-migration-archiving-backend` | [`session-migration-archiving-backend/SKILL.md`](./session-migration-archiving-backend/SKILL.md) | Backend + `libs/api` support for Vonage Video API session migration (server rotation) as it relates to archiving. |

## Using a skill with your tool

The instructions below apply to **any** skill in the table above. Replace `<skill-name>` with the
skill's folder name (e.g. `session-migration-archiving-backend`). Every skill's entry point is its
`SKILL.md`; point your assistant at that file, or wire it into your tool's instruction location.

### Kiro

Kiro discovers skills under `.kiro/skills/`. This project keeps the source of truth in `skills/` and
references each one from a steering file (`.kiro/steering/skills.md`), so Kiro loads them without
duplicating content. You can also just tell Kiro to read `skills/<skill-name>/SKILL.md`.

### Claude Code

Symlink (user-level):

```bash
ln -s "$(pwd)/skills/<skill-name>" ~/.claude/skills/<skill-name>
```

Or copy (project-level, shared with the team):

```bash
mkdir -p .claude/skills
cp -r skills/<skill-name> .claude/skills/
```

### Cursor

Copy or symlink the skill into `.cursor/rules/`, or reference
`skills/<skill-name>/SKILL.md` directly in chat.

### Windsurf

Add `skills/<skill-name>/` to your Cascade context.

### GitHub Copilot

Reference it with `@workspace`, or link it from `.github/copilot-instructions.md`
(the catalog is already linked there).

### Any other tool

The skill files are plain markdown. Use `skills/<skill-name>/SKILL.md` as the entry point.
