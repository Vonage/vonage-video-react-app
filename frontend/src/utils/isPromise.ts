export const isPromise = (value: unknown): value is PromiseLike<unknown> => {
  return Boolean(value && typeof (value as PromiseLike<unknown>).then === 'function');
};

export default isPromise;
