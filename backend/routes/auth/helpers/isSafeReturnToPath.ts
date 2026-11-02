function isSafeReturnToPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');
}

export default isSafeReturnToPath;
