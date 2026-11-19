import type { ExtensionStore } from '@api-lib/types/ExtensionStore';

const MAX_ENTRIES = 1000;

/**
 * Creates an extension store that keeps the longest extension of each session in memory.
 */
function createInMemoryExtensionStore(): ExtensionStore {
  const extendedMinutesBySessionId = new Map<string, number>();

  return {
    commitExtension({ sessionId, extendedMinutes }) {
      const storedMinutes = extendedMinutesBySessionId.get(sessionId) ?? 0;
      const committedMinutes = Math.max(storedMinutes, extendedMinutes);

      extendedMinutesBySessionId.delete(sessionId);
      extendedMinutesBySessionId.set(sessionId, committedMinutes);

      if (extendedMinutesBySessionId.size > MAX_ENTRIES) {
        const oldestSessionId = extendedMinutesBySessionId.keys().next().value!;
        extendedMinutesBySessionId.delete(oldestSessionId);
      }

      return committedMinutes;
    },
  };
}

export default createInMemoryExtensionStore;
