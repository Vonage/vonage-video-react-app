import isString from './isString';

function assertString(value: unknown, message?: string): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(message ?? `Expected a string but received ${typeof value}`);
  }
}

export default assertString;
