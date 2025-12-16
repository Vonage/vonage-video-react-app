/* eslint-disable no-underscore-dangle */
export const deferred = <T = void>(): {
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  promise: Promise<T>;
} => {
  let _resolve!: (value: T) => void;
  let _reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });

  return {
    resolve: _resolve,
    reject: _reject,
    promise,
  };
};

export default deferred;
