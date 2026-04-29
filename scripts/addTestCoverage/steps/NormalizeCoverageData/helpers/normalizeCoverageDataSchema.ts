import { z } from 'zod';

const CoverageMetricsSchema = z.object({
  statements: z.number(),
  branches: z.number(),
  functions: z.number(),
  lines: z.number(),
});

const FileExecutionSchema = z.object({
  runTestCommand: z.string(),
  runCoverageCommand: z.string(),
  notes: z.string(),
});

const FileRecommendationSchema = z.object({
  action: z.enum(['skip', 'improve', 'create']),
  reason: z.string(),
});

const NormalizedFileSchema = z.object({
  filePath: z.string(),
  language: z.string(),
  hasTests: z.boolean(),
  hasDirectTestFile: z.boolean(),
  directTestFileMatch: z.string().nullable(),
  testFilePatternMatch: z.enum(['direct', 'related', 'none']),
  testFiles: z.array(z.string()),
  coverage: CoverageMetricsSchema,
  coverageStatus: z.enum(['good', 'partial', 'missing']),
  execution: FileExecutionSchema,
  recommendation: FileRecommendationSchema,
  testStrategy: z.enum(['unit', 'integration', 'snapshot', 'unknown']),
  confidence: z.number().min(0).max(1),
});

const PipelineContextInfoSchema = z.object({
  projectType: z.enum(['node', 'react', 'angular', 'unknown']),
  testFramework: z.enum(['jest', 'vitest', 'mocha', 'unknown']),
  coverageTool: z.enum(['istanbul', 'c8', 'nyc', 'unknown']),
  commands: z.object({
    install: z.string(),
    test: z.string(),
    coverage: z.string(),
  }),
  dependencies: z.array(z.string()),
});

const ThresholdsSchema = z.object({
  statements: z.number(),
  branches: z.number(),
  functions: z.number(),
  lines: z.number(),
});

const NormalizeCoverageDataSchema = z.object({
  pipelineContext: PipelineContextInfoSchema,
  files: z.array(NormalizedFileSchema),
  thresholds: ThresholdsSchema,
});

export type NormalizeCoverageData = z.infer<typeof NormalizeCoverageDataSchema>;

export default NormalizeCoverageDataSchema;
