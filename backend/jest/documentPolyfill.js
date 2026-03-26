/**
 * Polyfill for document.cookie required by opentok-solutions-logging in Node.js test environment.
 * Must run before any module that imports opentok-solutions-logging is loaded.
 */
if (typeof globalThis.document === 'undefined') {
  let cookieStore = '';
  globalThis.document = {
    get cookie() {
      return cookieStore;
    },
    set cookie(val) {
      cookieStore = val;
    },
  };
}
