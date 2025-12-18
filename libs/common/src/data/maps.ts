export const isMap = (value: unknown): value is Map<unknown, unknown> =>
  value instanceof Map;

export default isMap;
