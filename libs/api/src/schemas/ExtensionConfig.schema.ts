import z from 'zod';
import { MAX_TOTAL_EXTENSION_MINUTES } from '@common/constants';

const ExtensionOptionSchema = z
  .number()
  .int()
  .positive()
  .max(MAX_TOTAL_EXTENSION_MINUTES, {
    message: `Every extension option must be less than or equal to ${MAX_TOTAL_EXTENSION_MINUTES}`,
  });

export const ExtensionConfigSchema = z.object({
  options: z.tuple([ExtensionOptionSchema], ExtensionOptionSchema),
}) satisfies z.ZodType<ExtensionConfig>;

export type ExtensionConfig = {
  /**
   * Number of minutes a single extension can add
   */
  options: [number, ...number[]];
};

export default ExtensionConfigSchema;
