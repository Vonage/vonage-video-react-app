import { isErrorLike } from '@common/assertions';
import type { HttpErrorLike } from '../../types';

export const isHttpErrorLike = (source: unknown): source is HttpErrorLike => {
  if (!isErrorLike(source)) return false;

  return Boolean((source as HttpErrorLike).response);
};

export default isHttpErrorLike;
