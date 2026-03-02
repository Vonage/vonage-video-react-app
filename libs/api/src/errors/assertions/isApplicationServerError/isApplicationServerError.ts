import { isApplicationError as isApplicationErrorBase } from '@common/errors/assertions';
import type ApplicationServerError from '../../ApplicationServerError';

/**
 * Checks if an object has the ApplicationServerError data structure.
 * Extends the base `isApplicationError` from common - currently identical but
 * allows for server-specific validation in the future.
 */
export const isApplicationServerError = (source: unknown): source is ApplicationServerError =>
  isApplicationErrorBase(source);

export default isApplicationServerError;
