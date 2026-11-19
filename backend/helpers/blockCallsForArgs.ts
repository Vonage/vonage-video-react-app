type PromiseMap = {
  [key: string]: PromiseWithResolvers<null>;
};

/**
 * Util to block simultaneous calls to a function until the first call resolves
 * @param {Function} fn - function to be blocked, first argument must be a string key
 * @returns {Function} wrapped function
 */
const blockCallsForArgs = <T>(fn: (key: string, ...args: unknown[]) => T) => {
  const callsInProgress: PromiseMap = {};
  return async (key: string, ...args: unknown[]): Promise<ReturnType<typeof fn>> => {
    const existing = callsInProgress[key];

    // Waiter: wait for the current owner, then run — but never touch the lock.
    // The previous implementation ran an unconditional resolve()/delete() for waiters
    // too, which could release a *different, later* owner's lock (with 3+ concurrent
    // calls), breaking mutual exclusion and allowing the duplicate work this guards.
    if (existing) {
      await existing.promise;
      return fn(key, ...args);
    }

    // Owner: hold the lock for the duration of fn. Callers stay waiters while
    // callsInProgress[key] is set, so no second owner can appear until this entry is
    // cleared here — meaning the delete only ever removes this owner's own lock.
    const lock = Promise.withResolvers<null>();
    callsInProgress[key] = lock;
    try {
      return await fn(key, ...args);
    } finally {
      delete callsInProgress[key];
      lock.resolve(null);
    }
  };
};

export default blockCallsForArgs;
