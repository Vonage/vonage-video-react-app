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
    if (callsInProgress[key]) {
      await callsInProgress[key].promise;
    } else {
      const promiseWithResolvers = Promise.withResolvers<null>();
      callsInProgress[key] = promiseWithResolvers;
    }
    const res = await fn(key, ...args);
    callsInProgress[key]?.resolve(null);
    delete callsInProgress[key];
    return res;
  };
};

export default blockCallsForArgs;
