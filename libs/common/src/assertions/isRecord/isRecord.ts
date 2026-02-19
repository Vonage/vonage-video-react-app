import isNil from '../isNil';

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (isNil(value) || typeof value !== 'object') return false;

  if (Array.isArray(value)) return false;
  if (value instanceof Map) return false;
  if (value instanceof Set) return false;
  if (value instanceof Date) return false;

  return true;
};

export default isRecord;
