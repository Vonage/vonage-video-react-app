import isErrorLike from '../../../assertions/isErrorLike';
import type { ApplicationErrorState } from '../../types';

/**
 * Checks if an object has the minimum properties of an `ApplicationError`.
 */
export const isApplicationErrorLike = (
  source: unknown
): source is Partial<ApplicationErrorState> & {
  message: string;
} => isErrorLike(source);

export default isApplicationErrorLike;
