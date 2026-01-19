/**
 * Converts a kebab-case string to camelCase.
 * Example: 'hello-world' -> 'helloWorld'
 */
export type KebabToCamel<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Lowercase<Head>}${Capitalize<KebabToCamel<Tail>>}`
  : Lowercase<S>;
