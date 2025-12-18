import { isNil } from './data/nils';
import { isPrimitive } from './data/primitive';
import { isRecord } from './data/records';
import { isDate } from './data/dates';
import { isArray } from './data/arrays';
import isMap from './data/maps';
import { isSet } from './data/sets';

/**
 * Returns true if the two values are equal.
 */
export const shallowCompare = <T>(value1: T, value2: T) => {
  const isEqual = value1 === value2;
  if (isEqual) return true;

  if (canCheckSimpleEquality(value1, value2)) {
    return value1 === value2;
  }

  if (isArray(value1) && isArray(value2)) {
    return isEqualArray(value1, value2);
  }

  if (isMap(value1) && isMap(value2)) {
    return isEqualMap(value1, value2);
  }

  if (isSet(value1) && isSet(value2)) {
    return isEqualSet(value1, value2);
  }

  if (!isRecord(value1) || !isRecord(value2)) return value1 === value2;

  return isEqualObject(value1, value2);
};

const canCheckSimpleEquality = (value1: unknown, value2: unknown): boolean => {
  const typeofValue1 = typeof value1;
  const typeofValue2 = typeof value2;

  // simple equality check will trigger false if types are different
  if (typeofValue1 !== typeofValue2) return true;

  return (
    isNil(value1) ||
    isNil(value2) ||
    (isPrimitive(value1) && isPrimitive(value2)) ||
    (isDate(value1) && isDate(value2)) ||
    (typeofValue1 === 'function' && typeofValue2 === 'function')
  );
};

const isEqualArray = <T>(array1: T[], array2: T[]): boolean => {
  if (array1.length !== array2.length) return false;

  for (let i = 0; i < array1.length; i += 1) {
    const $value1 = array1[i];
    const $value2 = array2[i];

    if ($value1 !== $value2) return false;
  }

  return true;
};

const isEqualMap = <K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean => {
  if (map1.size !== map2.size) return false;

  for (const [key, value] of map1) {
    const $value2 = map2.get(key);

    if (value !== $value2) return false;
  }

  return true;
};

const isEqualSet = <T>(set1: Set<T>, set2: Set<T>): boolean => {
  if (set1.size !== set2.size) return false;

  for (const value of set1) {
    if (!set2.has(value)) return false;
  }

  return true;
};

const isEqualObject = <T extends Record<string, unknown>>(
  value1: T,
  value2: T
): boolean => {
  const keys1 = Object.keys(value1);
  const keys2 = Object.keys(value2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    const propObject1 = value1[key];
    const propObject2 = value2[key];

    if (propObject1 !== propObject2) return false;
  }

  return true;
};

export default shallowCompare;
