export const isPromise = (value: unknown): value is Promise<unknown> => {
  return Boolean(value && typeof (value as Promise<unknown>).then === 'function');
};

export default isPromise;
