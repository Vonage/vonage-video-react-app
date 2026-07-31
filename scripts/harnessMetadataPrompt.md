# Harness Metadata Response Prompt

You are generating JSON metadata for a test-coverage harness.

## Required Output Rules

- Output only a JSON object.
- Do not include markdown code fences.
- Do not include prose before or after JSON.
- First character must be `{` and last character must be `}`.

## Required Output Schema

{
  "targetFilePath": "string",
  "suggestedTestFilePaths": ["string"],
  "recommendedCoverageCommand": "string",
  "recommendedTestCommand": "string",
  "behaviorsToTest": ["string"],
  "blockers": ["string"]
}

## Constraints

- `targetFilePath` must exactly match the requested file.
- Keep `behaviorsToTest` concise and high-value.
- If no blockers, return `[]`.
- Prefer file-scoped test and coverage commands when possible.
- Keep command outputs deterministic and shell-safe.

## Repository Policy Reminders

- Favor high-value tests over overtesting.
- Prefer real behavior assertions.
- Avoid overmocking.
- Use existing project test runners and conventions.
