import z from 'zod';

export const VeraActionSchema = z.enum([
  'getOrCreateSession',
  'startArchive',
  'stopArchive',
  'listArchives',
  'enableCaptions',
  'disableCaptions',
]);

export type VeraAction = z.infer<typeof VeraActionSchema>;

export default VeraActionSchema;
