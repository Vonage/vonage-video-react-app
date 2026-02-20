import isRecord from '../../../assertions/isRecord';
import type ApplicationError from '../../ApplicationError';

/**
 * Checks if an object has the ApplicationError data structure.
 */
export const isApplicationError = (source: unknown): source is ApplicationError =>
  isRecord(source) &&
  [
    source.values,
    source.severity,
    source.statusCode,
    source.fallbackConfig,
    source.message,
    source.stack,
  ].every((prop) => prop !== undefined);

export default isApplicationError;
