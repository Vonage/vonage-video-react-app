function readStringQueryParam(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default readStringQueryParam;
