import { z } from 'zod';

const IdTokenCookieSchema = z.object({
  idToken: z.string().min(1),
});

export type IdTokenCookie = z.infer<typeof IdTokenCookieSchema>;

export default IdTokenCookieSchema;
