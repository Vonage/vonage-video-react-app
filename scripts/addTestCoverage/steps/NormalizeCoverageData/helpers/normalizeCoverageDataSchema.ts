import { z } from 'zod';

const FileExecutionSchema = z.object({
  runTestCommand: z.string(),
  runCoverageCommand: z.string(),
});

const MAX_REASON_WORDS = 4;

const FileRecommendationSchema = z.object({
  action: z.enum(['skip', 'improve', 'create']),
  reason: z.string().refine((value) => value.split(/\s+/).length <= MAX_REASON_WORDS, {
    message: `Reason must be at most ${MAX_REASON_WORDS} words.`,
  }),
});

const NormalizedFileSchema = z.object({
  filePath: z.string(),
  language: z.string(),
  hasTests: z.boolean(),
  hasDirectTestFile: z.boolean(),
  directTestFileMatch: z.string().nullable(),
  testFilePatternMatch: z.enum(['direct', 'related', 'none']),
  testFiles: z.array(z.string()),
  execution: FileExecutionSchema,
  recommendation: FileRecommendationSchema,
  testStrategy: z.enum(['unit', 'integration', 'snapshot', 'unknown']),
  confidence: z.number().min(0).max(1),
});

const PipelineContextInfoSchema = z.object({
  projectType: z.enum(['node', 'react', 'angular', 'unknown']),
  testFramework: z.enum(['jest', 'vitest', 'mocha', 'unknown']),
  commands: z.object({
    test: z.string(),
    coverage: z.string(),
  }),
});

const NormalizeCoverageDataSchema = z.object({
  pipelineContext: PipelineContextInfoSchema,
  files: z.array(NormalizedFileSchema),
});

export type NormalizeCoverageData = z.infer<typeof NormalizeCoverageDataSchema>;

export default NormalizeCoverageDataSchema;
