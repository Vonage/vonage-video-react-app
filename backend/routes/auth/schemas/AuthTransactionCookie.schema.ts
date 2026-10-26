import { z } from 'zod';

const AuthTransactionCookieSchema = z.object({
  state: z.string().min(1),
  codeVerifier: z.string().min(1),
  returnTo: z.string().min(1),
});

export type AuthTransactionCookie = z.infer<typeof AuthTransactionCookieSchema>;

export default AuthTransactionCookieSchema;
