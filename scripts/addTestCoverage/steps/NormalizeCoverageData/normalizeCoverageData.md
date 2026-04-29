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
    "commands": {
      "test": "string",
      "coverage": "string"
    }
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
      "execution": {
        "runTestCommand": "string",
        "runCoverageCommand": "string"
      },
      "recommendation": {
        "action": "skip|improve|create",
        "reason": "string (max 4 words)"
      },
      "testStrategy": "unit|integration|snapshot|unknown",
      "confidence": number
    }
  ]
}

---

## Instructions

1. Detect project type and test framework

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

3. Provide commands to:
   - run tests
   - run coverage

4. Provide per-file execution commands scoped to the file when possible

5. Assign recommendation:
   - "skip" → tests already exist and cover the file
   - "improve" → tests exist but incomplete
   - "create" → no tests exist

---

## Output Constraint

Your entire response must be a single, raw JSON object.
Do NOT wrap the JSON in markdown code fences (no ``` or ```json).
Do NOT include any text before or after the JSON.
Do NOT add explanations, comments, or whitespace outside the JSON.
The first character of your response must be `{` and the last must be `}`.
