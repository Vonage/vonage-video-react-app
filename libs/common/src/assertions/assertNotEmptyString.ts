import assertString from './assertString';
import isEmptyString from './isEmptyString';

function assertNotEmptyString(value: unknown, message?: string): asserts value is string {
  assertString(value, message ?? `Expected a string but received ${typeof value}`);

  if (isEmptyString(value)) {
    throw new TypeError(message ?? `Expected a non-empty string but received ${typeof value}`);
  }
}

export default assertNotEmptyString;
