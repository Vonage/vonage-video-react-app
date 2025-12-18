import { z } from 'zod';

export const storageProviderSchema = z.object({
  getItem: z.function({
    input: z.tuple([z.string()]),
    output: z.promise(z.string().nullable()),
  }),

  setItem: z.function({
    input: z.tuple([z.string(), z.string()]),
    output: z.promise(z.void()),
  }),
});

export interface IStorageProvider {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}
