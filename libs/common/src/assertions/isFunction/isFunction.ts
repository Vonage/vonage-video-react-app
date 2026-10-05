import type { Any } from '../../types';

const isFunction = <T extends (...args: Any[]) => Any>(value: unknown): value is NonNullable<T> =>
  typeof value === 'function' || value instanceof Function;

export default isFunction;
