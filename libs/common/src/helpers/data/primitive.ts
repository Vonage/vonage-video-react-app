import { isBoolean } from './booleans';
import { isNil } from './nils';
import { isNumber } from './numbers';
import { isString } from './strings';

export const isPrimitive = (
  value: unknown
): value is null | number | boolean | string | symbol =>
  isNil(value) ||
  isNumber(value) ||
  isBoolean(value) ||
  isString(value) ||
  typeof value === 'symbol';

export default isPrimitive;
