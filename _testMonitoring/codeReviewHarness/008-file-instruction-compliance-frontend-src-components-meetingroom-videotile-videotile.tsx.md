# Segment 008

- name: file-instruction-compliance-frontend-src-components-meetingroom-videotile-videotile.tsx
- attempts: 1
- status: success
- timestamp: 2026-07-31T23:31:36.316Z

## Output

```text
{
  "status": "pass",
  "checkedFileCount": 2,
  "evidence": {
    "validatedFiles": [
      "frontend/src/components/MeetingRoom/VideoTile/VideoTile.tsx",
      "frontend/src/components/MeetingRoom/VideoTile/VideoTile.spec.tsx"
    ],
    "reviewedRules": [
      {
        "ruleId": "copilot-no-react-suspense-direct",
        "description": "Do not use React.Suspense or Suspense directly; use SuspenseBoundary/Suspense$.",
        "instructionsSource": ".github/copilot-instructions.md"
      },
      {
        "ruleId": "copilot-no-react-use-direct",
        "description": "Do not use React.use directly; use boundary-aware use$ patterns.",
        "instructionsSource": ".github/copilot-instructions.md"
      },
      {
        "ruleId": "copilot-no-mui-sx-prop",
        "description": "MUI sx prop is banned by repository rules.",
        "instructionsSource": ".github/copilot-instructions.md"
      },
      {
        "ruleId": "copilot-no-mui-grid",
        "description": "MUI Grid is banned; use Tailwind flex/grid utilities.",
        "instructionsSource": ".github/copilot-instructions.md"
      },
      {
        "ruleId": "copilot-no-tailwind-group-class",
        "description": "Tailwind group class usage is banned.",
        "instructionsSource": ".github/copilot-instructions.md"
      },
      {
        "ruleId": "copilot-no-display-none-hiding",
        "description": "Do not hide components with display:none; use Activity mode handling.",
        "instructionsSource": ".github/copilot-instructions.md"
      },
      {
        "ruleId": "copilot-no-nested-try-catch",
        "description": "Nested try/catch blocks are banned; prefer linear tryCatch helper patterns.",
        "instructionsSource": ".github/copilot-instructions.md"
      },
      {
        "ruleId": "test-no-snapshot-tests",
        "description": "Snapshot assertions are banned in test files.",
        "instructionsSource": ".github/instructions/test-files.instructions.md"
      },
      {
        "ruleId": "test-no-mocked-cast",
        "description": "as Mocked<...> casting is banned; use vi.mocked(...) for typed mocks.",
        "instructionsSource": ".github/instructions/test-files.instructions.md"
      },
      {
        "ruleId": "test-no-settimeout",
        "description": "setTimeout is banned for async test synchronization.",
        "instructionsSource": ".github/instructions/test-files.instructions.md"
      },
      {
        "ruleId": "test-no-waitfortimeout",
        "description": "waitForTimeout is banned for async test synchronization.",
        "instructionsSource": ".github/instructions/test-files.instructions.md"
      },
      {
        "ruleId": "test-no-global-cleanup-boilerplate",
        "description": "Do not call global cleanup boilerplate in test files; it is already provided by global setup.",
        "instructionsSource": ".github/instructions/test-files.instructions.md"
      },
      {
        "ruleId": "test-async-expect-assertions-required",
        "description": "Async tests must declare expect.assertions(n) at the start of the async test body.",
        "instructionsSource": ".github/instructions/test-files.instructions.md"
      }
    ],
    "ruleScores": [
      {
        "ruleId": "copilot-no-react-suspense-direct",
        "description": "Do not use React.Suspense or Suspense directly; use SuspenseBoundary/Suspense$.",
        "instructionsSource": ".github/copilot-instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "copilot-no-react-use-direct",
        "description": "Do not use React.use directly; use boundary-aware use$ patterns.",
        "instructionsSource": ".github/copilot-instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "copilot-no-mui-sx-prop",
        "description": "MUI sx prop is banned by repository rules.",
        "instructionsSource": ".github/copilot-instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "copilot-no-mui-grid",
        "description": "MUI Grid is banned; use Tailwind flex/grid utilities.",
        "instructionsSource": ".github/copilot-instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "copilot-no-tailwind-group-class",
        "description": "Tailwind group class usage is banned.",
        "instructionsSource": ".github/copilot-instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "copilot-no-display-none-hiding",
        "description": "Do not hide components with display:none; use Activity mode handling.",
        "instructionsSource": ".github/copilot-instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "copilot-no-nested-try-catch",
        "description": "Nested try/catch blocks are banned; prefer linear tryCatch helper patterns.",
        "instructionsSource": ".github/copilot-instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "test-no-snapshot-tests",
        "description": "Snapshot assertions are banned in test files.",
        "instructionsSource": ".github/instructions/test-files.instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "test-no-mocked-cast",
        "description": "as Mocked<...> casting is banned; use vi.mocked(...) for typed mocks.",
        "instructionsSource": ".github/instructions/test-files.instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "test-no-settimeout",
        "description": "setTimeout is banned for async test synchronization.",
        "instructionsSource": ".github/instructions/test-files.instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "test-no-waitfortimeout",
        "description": "waitForTimeout is banned for async test synchronization.",
        "instructionsSource": ".github/instructions/test-files.instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "test-no-global-cleanup-boilerplate",
        "description": "Do not call global cleanup boilerplate in test files; it is already provided by global setup.",
        "instructionsSource": ".github/instructions/test-files.instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      },
      {
        "ruleId": "test-async-expect-assertions-required",
        "description": "Async tests must declare expect.assertions(n) at the start of the async test body.",
        "instructionsSource": ".github/instructions/test-files.instructions.md",
        "violationCount": 0,
        "status": "passed",
        "score": 100,
        "affectedFiles": []
      }
    ],
    "reviewedRuleCount": 13,
    "violationCount": 0,
    "violations": [],
    "score": {
      "passedRules": 13,
      "totalRules": 13,
      "percentage": 100
    }
  }
}
```