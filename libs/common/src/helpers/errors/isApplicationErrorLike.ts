import { isErrorLike } from '../data/errors';
import { ApplicationErrorState } from './ApplicationError.types';

/**
 * Checks if an object has the minimum properties of an `ApplicationError`.
 */
export const isApplicationErrorLike = (
  source: unknown
): source is Partial<ApplicationErrorState> & {
  message: string;
} => isErrorLike(source);

export default isApplicationErrorLike;
