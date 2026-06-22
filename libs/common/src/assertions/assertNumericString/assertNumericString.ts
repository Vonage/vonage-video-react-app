import isNumericString from '../isNumericString';

function assertNumericString(value: unknown, message?: string): asserts value is string {
  if (!isNumericString(value)) {
    throw new TypeError(message ?? `${String(value)} is not a valid number string`);
  }
}

export default assertNumericString;
