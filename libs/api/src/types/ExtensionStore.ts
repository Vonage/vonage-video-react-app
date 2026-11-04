export type ExtensionStore = {
  /**
   * Stores the extended minutes of a session unless a longer extension is already stored,
   * and returns the stored value. Implementations must apply this atomically.
   */
  commitExtension(args: { sessionId: string; extendedMinutes: number }): number | Promise<number>;
};

export default ExtensionStore;
