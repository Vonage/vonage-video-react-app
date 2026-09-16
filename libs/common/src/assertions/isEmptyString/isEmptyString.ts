import isString from '../isString';

export const isEmptyString = (value: unknown): value is string =>
  isString(value) && value.length === 0;

export default isEmptyString;
