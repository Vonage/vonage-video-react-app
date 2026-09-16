import { z } from 'zod';

export enum Lang {
  EN = 'en',
  IT = 'it',
  ES = 'es',
  ES_MX = 'es-MX',
  EN_US = 'en-US',
  DE = 'de',
  JA = 'ja',
}

export const LangSchema = z.enum(Lang);

export function assertLang(data: unknown): asserts data is Lang {
  const parsed = LangSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(`Invalid Lang value: ${data}`, { cause: parsed.error });
  }
}

export default LangSchema;
