type PromiseMap = {
  [key: string]: PromiseWithResolvers<null>;
};

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
const blockCallsForArgs = <T>(fn: (key: string, ...args: any[]) => T) => {
  const callsInProgress: PromiseMap = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (key: string, ...args: any[]): Promise<ReturnType<typeof fn>> => {
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
