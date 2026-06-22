import isString from '../isString';

function isNumericString(value: unknown): value is string {
  if (!isString(value)) {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return Number.isFinite(Number(trimmed));
}

export default isNumericString;
