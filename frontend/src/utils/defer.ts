export type Deferred<T = void> = {
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  promise: Promise<T>;
};

/**
 * @description Creates a deferred promise with exposed resolve and reject methods.
 * @returns {Deferred<any>} The deferred promise object.
 */
const defer = <T>(): Deferred<T> => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { resolve, reject, promise };
};

export default defer;
