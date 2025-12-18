export const isObject = (source: unknown): source is Record<string, unknown> =>
  Boolean(source) && typeof source === 'object';

export default isObject;
