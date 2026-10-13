# Comments

Default to no comments. This applies to every file and format.

Never add a comment that:

- narrates a change, or only makes sense as a reaction to one ("no X here", "required because",
  "kept for", "unused today", "moved from")
- justifies a decision, a tradeoff, or an alternative that was rejected
- restates code, names, or values
- repeats behavior that something else already enforces: a schema, validator, type, lint rule, test
- cites another file in this repository as justification — the reader can open it
- records history, or adds banners, dividers, TODOs, notes, or filler

Only allow comment when preserving a fact the code cannot express and that materially affects correctness or maintenance: an external constraint, upstream bug, spec/ticket, or measured limit. Keep it factual and to 1–2 lines.

Why you changed something belongs in your reply, the commit message, or the PR description, never in
the file.

Leave existing comments alone unless they become wrong or misleading. When you delete code, delete
its comment with it rather than replacing it with a note about the removal. When unsure, omit the
comment.
