/**
 * Like keyof, but only returns keys whose values are objects
 */
export type ObjectKeys<T> = {
  [K in keyof T]: T[K] extends object ? K : never;
}[keyof T];

export default ObjectKeys;
