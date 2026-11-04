import z from 'zod';

const ExtensionOptionSchema = z.number().int().positive();

export const ExtensionConfigSchema = z
  .object({
    maxTotalMinutes: z.number().int().positive(),
    options: z.tuple([ExtensionOptionSchema], ExtensionOptionSchema),
  })
  .refine(
    ({ maxTotalMinutes, options }) => options.every((minutes) => minutes <= maxTotalMinutes),
    {
      message: 'Every extension option must be less than or equal to maxTotalMinutes',
      path: ['options'],
    }
  ) satisfies z.ZodType<ExtensionConfig>;

export type ExtensionConfig = {
  /**
   * Maximum number of minutes a scheduled session can be extended by, in total
   */
  maxTotalMinutes: number;
  /**
   * Number of minutes a single extension can add
   */
  options: [number, ...number[]];
};

export default ExtensionConfigSchema;
