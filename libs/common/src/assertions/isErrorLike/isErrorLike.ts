import isObject from '../isObject';

export const isErrorLike = (
  source: unknown
): source is Partial<Error> & {
  message: string;
} => isObject(source) && typeof source.message === 'string';

export default isErrorLike;
