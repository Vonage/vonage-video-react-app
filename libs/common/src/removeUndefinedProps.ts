import { isUndefined } from './data/nils';

export const removeUndefinedProps = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  source: Record<string, unknown>
) =>
  Object.fromEntries(
    Object.entries(source).filter(([, value]) => !isUndefined(value))
  ) as T;

export default removeUndefinedProps;
