export const isFunction = (source: unknown): source is (...args: unknown[]) => unknown =>
  Boolean(source) && typeof source === 'function';

export default isFunction;
