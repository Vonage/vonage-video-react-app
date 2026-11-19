import { z } from 'zod';
import type { AuthConfig } from '../types/config';

const SignedInSessionKeySecretSchema = z.object({
  sessionKeySecret: z.string().min(1, {
    message:
      'SESSION_KEY_SECRET is required when AUTH_ENABLED is true: set SESSION_KEY_SECRET (generate one with `pnpm generate:secret`)',
  }),
});

function assertSessionKeySecretMatchesAuth({
  authConfig,
  sessionKeySecret,
}: {
  authConfig: AuthConfig;
  sessionKeySecret: string;
}): void {
  if (!authConfig.authEnabled) return;

  SignedInSessionKeySecretSchema.parse({ sessionKeySecret });
}

export default assertSessionKeySecretMatchesAuth;
