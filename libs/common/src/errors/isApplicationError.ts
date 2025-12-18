import { isRecord } from '../data/records';
import type ApplicationError from './ApplicationError';

/**
 * Checks if an object is an instance of `ApplicationError`.
 */
export const isApplicationError = (source: unknown): source is ApplicationError =>
  isRecord(source) &&
  // eslint-disable-next-line no-underscore-dangle
  Boolean(source?.__custom_application_error__);

export default isApplicationError;
