export const isUndefined = (value: unknown): value is undefined => value === undefined;

export const isNil = (value: unknown): value is null | undefined =>
  value === null || isUndefined(value);

export const isNotNil = (value: unknown): value is NonNullable<unknown> => !isNil(value);

export function assertNotNil<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (isNil(value)) {
    throw new TypeError(
      message ?? `Expected a non-null, non-undefined value, but received: ${value}`
    );
  }
}
