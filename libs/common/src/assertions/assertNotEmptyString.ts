import isEmptyString from './isEmptyString';

function assertNotEmptyString(value: unknown, message?: string): asserts value is string {
  if (isEmptyString(value)) {
    throw new TypeError(message ?? `Expected a non-empty string but received ${typeof value}`);
  }
}

export default assertNotEmptyString;
