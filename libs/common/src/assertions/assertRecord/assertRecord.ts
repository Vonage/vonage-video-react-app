import isRecord from '../isRecord';

function assertRecord(value: unknown, message?: string): asserts value is Record<string, unknown> {
  if (!isRecord(value)) {
    throw new TypeError(message || 'Expected value to be a record Record<string, unknown>');
  }
}

export default assertRecord;
