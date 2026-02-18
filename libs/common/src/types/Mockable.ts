import type { Any } from './Any';
import type { AnyFunction } from './AnyFunction';

export const SPY_MARK = Symbol('spy_mark');

/**
 * Allows mocking object properties by providing either:
 * - a function, or
 * - a value used as the function’s return value.
 */
export type Mockable<T extends Partial<{ [key: string | number | symbol]: Any }>> = Partial<{
  [K in keyof T]: T[K] extends AnyFunction ? T[K] | ReturnType<T[K]> | typeof SPY_MARK : T[K];
}>;
