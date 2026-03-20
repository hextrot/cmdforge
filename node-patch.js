// Node 25 exposes localStorage but it's broken without --localstorage-file
// Patch it to work as an in-memory store for SSR
if (typeof globalThis.localStorage !== 'undefined') {
  try {
    globalThis.localStorage.getItem('test');
  } catch {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
      get length() { return store.size; },
      key: (index) => [...store.keys()][index] ?? null,
    };
  }
}
