function isDarkMode(): boolean {
  return globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default isDarkMode;
