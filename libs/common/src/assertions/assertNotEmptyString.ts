import isString from './isString';

function assertNotEmptyString(value: unknown, message?: string): asserts value is string {
  if (!isString(value) || value.length === 0) {
    throw new TypeError(message ?? `Expected a non-empty string but received ${typeof value}`);
  }
}

export default assertNotEmptyString;
