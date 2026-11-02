import { z } from 'zod';

const SessionCookieSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresAt: z.number().int().positive(),
  refreshToken: z.string().min(1).optional(),
});

export type SessionCookie = z.infer<typeof SessionCookieSchema>;

export default SessionCookieSchema;
