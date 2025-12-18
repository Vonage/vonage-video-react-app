export const isSet = (value: unknown): value is Set<unknown> =>
  value instanceof Set;

export default isSet;
