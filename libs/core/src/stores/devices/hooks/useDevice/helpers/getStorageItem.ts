function getStorageItem(key: string): string | null {
  if (typeof globalThis === 'undefined' || !globalThis.localStorage) return null;
  return globalThis.localStorage.getItem(key);
}

export default getStorageItem;
