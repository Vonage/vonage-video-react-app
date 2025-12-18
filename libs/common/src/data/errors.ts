import isRecord from './records';

export const isErrorLike = (
  source: unknown
): source is Partial<Error> & {
  message: string;
} => isRecord(source) && Boolean(source?.message);

export default isErrorLike;
