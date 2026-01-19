import { z } from 'zod';
import type { AuthParams as AuthParamsVonage } from '@vonage/auth';
import SignedHashParamsSchema from './SignedHashParams.schema';
import GeneratorOptionsSchema from './GeneratorOptions.schema';

/**
 * We use our own AuthParams to force using a discriminated union which avoids confusion around which fields are required for each auth type
 */
export type AuthParams = z.infer<typeof AuthParamsSchema>;

const ApiKeyAuthSchema = z.object({
  authType: z.literal('apiKey'),
  apiKey: z.string(),
  apiSecret: z.string(),
});

const JwtAuthSchema = z.object({
  authType: z.literal('jwt'),
  applicationId: z.string(),
  privateKey: z.union([z.string(), z.instanceof(Buffer)]),
  jwtOptions: GeneratorOptionsSchema.optional(),
});

const SignatureAuthSchema = z.object({
  authType: z.literal('signature'),
  apiKey: z.string(),
  signature: SignedHashParamsSchema,
});

export const AuthParamsSchema = z.discriminatedUnion('authType', [
  ApiKeyAuthSchema,
  JwtAuthSchema,
  SignatureAuthSchema,
]) satisfies z.ZodType<AuthParamsVonage>;

export function assertAuthParams(params: unknown): asserts params is AuthParams {
  AuthParamsSchema.parse(params);
}

export default AuthParamsSchema;
