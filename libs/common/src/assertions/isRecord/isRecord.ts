import isNil from '../isNil';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  !isNil(value) && typeof value === 'object';

export default isRecord;
