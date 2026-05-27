import { isNotNil } from '@common/assertions';
import { isApplicationErrorLike } from '@common/errors';
import { ZodError } from 'zod';

function isZodError(error: unknown): error is ZodError {
  if (error instanceof ZodError) return true;

  return isApplicationErrorLike(error) && error.name === 'ZodError' && isNotNil(error.issues);
}

export default isZodError;
