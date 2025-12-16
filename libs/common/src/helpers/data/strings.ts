export const capitalize = (str: string): string => {
  assertString(str);

  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalizes the first letter of each word in a string.
 */
export const capitalizeWords = (str: string): string => {
  assertString(str);

  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export function assertString(
  value: unknown,
  message?: string
): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(
      message ?? `Expected a string, but received: ${typeof value}`
    );
  }
}

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};
