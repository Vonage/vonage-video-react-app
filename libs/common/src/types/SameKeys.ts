export type SameKeys<T> = {
  [K in keyof T]?: unknown;
};

export default SameKeys;
