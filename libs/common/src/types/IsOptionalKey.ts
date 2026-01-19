export type IsOptionalKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {} extends Pick<T, K>
      ? true
      : false
    : false
  : never;

export default IsOptionalKey;
