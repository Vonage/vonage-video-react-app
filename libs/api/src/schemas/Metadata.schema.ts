import z from 'zod';

export const MetadataSchema = z.object({}).loose().optional();

export type Metadata = z.infer<typeof MetadataSchema>;

export default MetadataSchema;
