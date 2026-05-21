import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import isZodError from './isZodError';

const schema = z.object({
  name: z.string(),
});

describe('isZodError', () => {
  it('returns true for a ZodError', () => {
    const result = schema.safeParse({ name: 123 });
    expect(result.success).toBe(false);
    expect(isZodError(!result.success && result.error)).toBe(true);
    expect(isZodError(new Error('Not a Zod error'))).toBe(false);
  });
});
