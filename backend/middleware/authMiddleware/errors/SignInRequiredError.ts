import { StatusCode } from 'status-code-enum';
import { ApplicationServerError } from '@api-lib/errors';
import type { Any } from '@common/types';

class SignInRequiredError extends ApplicationServerError {
  public readonly isSignInRequired = true;
}

export const makeSignInRequiredErrorHandler = (fallbackMessage = 'Sign-in required') => {
  return (error: Any) =>
    new SignInRequiredError({
      src: error,
      fallbackConfig: {
        fallbackMessage,
        statusCode: StatusCode.ClientErrorUnauthorized,
      },
    });
};

export default SignInRequiredError;
