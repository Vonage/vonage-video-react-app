# CI Pipeline Structured Output Prompt

You are generating structured output for a CI pipeline.

## Objective
Produce a **strict JSON response** that can be consumed by downstream pipeline stages for:
- coverage normalization
- filtering
- test improvement
- test generation

---

## Rules

- Output ONLY valid JSON
- Do NOT include explanations
- Do NOT include markdown formatting in the output
- Follow the schema exactly
- If data is missing, use explicit values like "unknown" or "missing"

---

## Required Schema

{
  "pipelineContext": {
    "projectType": "node|react|angular|unknown",
    "testFramework": "jest|vitest|mocha|unknown",
    "coverageTool": "istanbul|c8|nyc|unknown",
    "commands": {
      "install": "string",
      "test": "string",
      "coverage": "string"
    },
    "dependencies": ["string"]
  },
  "files": [
    {
      "filePath": "string",
      "language": "string",
      "hasTests": true,
      "hasDirectTestFile": true,
      "directTestFileMatch": "string|null",
      "testFilePatternMatch": "direct|related|none",
      "testFiles": ["string"],
      "coverage": {
        "statements": number,
        "branches": number,
        "functions": number,
        "lines": number
      },
      "coverageStatus": "good|partial|missing",
      "execution": {
        "runTestCommand": "string",
        "runCoverageCommand": "string",
        "notes": "string"
      },
      "recommendation": {
        "action": "skip|improve|create",
        "reason": "string"
      },
      "testStrategy": "unit|integration|snapshot|unknown",
      "confidence": number
    }
  ],
  "thresholds": {
    "statements": 85,
    "branches": 80,
    "functions": 85,
    "lines": 85
  }
}

---

## Instructions

1. Detect project type, test framework, and coverage tool

2. For each source file:
   - Detect if tests exist
   - Identify ALL related test files
   - Detect if a **direct test file exists**:
     - Example: Button.tsx → Button.test.tsx or Button.spec.tsx
   - If such file exists:
     - set "hasDirectTestFile" = true
     - set "directTestFileMatch" = exact path
     - set "testFilePatternMatch" = "direct"
   - If only indirect tests exist:
     - set "hasDirectTestFile" = false
     - set "testFilePatternMatch" = "related"
   - If no tests exist:
     - set "hasDirectTestFile" = false
     - set "testFilePatternMatch" = "none"

3. Extract coverage metrics if available
   - If not available, set coverageStatus = "missing"

4. Provide commands to:
   - install dependencies
   - run tests
   - run coverage

5. Provide per-file execution commands scoped to the file when possible

6. Assign recommendation:
   - "skip" → coverage meets thresholds
   - "improve" → tests exist but coverage below threshold
   - "create" → no tests exist

7. Assign a confidence score (0 to 1)

---

## Thresholds

- statements: 85
- branches: 80
- functions: 85
- lines: 85

---

## Output Constraint

Your entire response must be a single, raw JSON object.
Do NOT wrap the JSON in markdown code fences (no ``` or ```json).
Do NOT include any text before or after the JSON.
Do NOT add explanations, comments, or whitespace outside the JSON.
The first character of your response must be `{` and the last must be `}`.
