type Camelize<S extends string> =
  S extends `${infer Head}-${infer Tail}`
    ? `${Head}${Capitalize<Camelize<Tail>>}`
    : S;