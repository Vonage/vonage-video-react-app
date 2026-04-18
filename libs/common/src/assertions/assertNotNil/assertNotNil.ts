import isNil from '../isNil';

function assertNotNil<T>(value: T, message?: string): asserts value is NonNullable<T> {
  if (isNil(value)) {
    throw new TypeError(message || 'Expected value to be non-null and non-undefined');
  }
}

export default assertNotNil;
