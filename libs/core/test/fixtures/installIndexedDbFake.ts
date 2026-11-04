import { vi } from 'vitest';

type FakeObjectStore = {
  keyPath: string;
  records: Map<unknown, unknown>;
};

type Callback = (() => void) | null;

/**
 * jsdom has no IndexedDB. This in-memory stand-in covers open, keyPath object stores and get, getAll, put and delete.
 */
function installIndexedDbFake() {
  const databases = new Map<string, Map<string, FakeObjectStore>>();

  vi.stubGlobal('indexedDB', {
    open(name: string) {
      const isNewDatabase = !databases.has(name);
      const objectStores = databases.get(name) ?? new Map<string, FakeObjectStore>();
      databases.set(name, objectStores);

      const database = {
        createObjectStore(storeName: string, { keyPath }: { keyPath: string }) {
          objectStores.set(storeName, { keyPath, records: new Map() });
        },
        transaction(storeName: string) {
          return makeFakeTransaction(objectStores.get(storeName)!);
        },
        close() {},
      };

      const request = {
        result: database,
        error: null,
        onupgradeneeded: null as Callback,
        onsuccess: null as Callback,
        onerror: null as Callback,
      };

      setTimeout(() => {
        if (isNewDatabase) request.onupgradeneeded?.();
        request.onsuccess?.();
      });

      return request;
    },
  });
}

function makeFakeTransaction({ keyPath, records }: FakeObjectStore) {
  const transaction = {
    error: null,
    oncomplete: null as Callback,
    onabort: null as Callback,
    objectStore: () => ({
      get: (key: unknown) => ({ result: structuredClone(records.get(key)) }),
      getAll: () => ({ result: [...records.values()].map((record) => structuredClone(record)) }),
      put: (value: Record<string, unknown>) => {
        records.set(value[keyPath], structuredClone(value));
        return { result: value[keyPath] };
      },
      delete: (key: unknown) => {
        records.delete(key);
        return { result: undefined };
      },
    }),
  };

  setTimeout(() => transaction.oncomplete?.());

  return transaction;
}

export default installIndexedDbFake;
