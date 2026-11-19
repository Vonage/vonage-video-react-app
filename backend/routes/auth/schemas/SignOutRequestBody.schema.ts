import { z } from 'zod';

const SignOutRequestBodySchema = z.object({
  refresh_token: z.string().min(1).optional(),
});

export type SignOutRequestBody = z.infer<typeof SignOutRequestBodySchema>;

export default SignOutRequestBodySchema;
