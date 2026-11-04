import createInMemoryExtensionStore from './createInMemoryExtensionStore';

/**
 * Process-wide extension store, shared by every VideoClient that is not given its own store.
 */
const defaultExtensionStore = createInMemoryExtensionStore();

export default defaultExtensionStore;
