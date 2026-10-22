import { isApplicationErrorLike as isApplicationErrorLikeBase } from '@common/errors/assertions';
import type { ApplicationErrorState } from '@common/errors/types';

/**
 * Checks if an object has the minimum properties of an `ApplicationServerError`.
 * Extends the base `isApplicationErrorLike` from common - currently identical but
 * allows for server-specific validation in the future.
 */
export const isApplicationServerErrorLike = (
  source: unknown
): source is Partial<ApplicationErrorState> & {
  message: string;
} => isApplicationErrorLikeBase(source);

export default isApplicationServerErrorLike;
