import { isFunction } from '@common/assertions';
import type { AnyFunction } from '@common/types';

/**
 * Utility to override XMLHttpRequest methods with custom handlers.
 *
 * In principle, we need to override sometimes the `open` of the XMLHttpRequest,
 * but could be extended to other methods if needed and we already have the same pattern for patching other APIs
 */
const xmlHttpRequestEnvelop = (() => {
  const originalRegistry = new Map<string, AnyFunction>();

  const api = {
    override<
      K extends FunctionKeys<XMLHttpRequest>,
      Handler extends AnyFunction = XMLHttpRequest[K],
    >(
      method: K,
      builder: (args: {
        handler: Handler;
      }) => (this: XMLHttpRequest, ...args: Parameters<Handler>) => ReturnType<Handler>
    ): Unsubscribe {
      const original = api.getOriginal(method);

      XMLHttpRequest.prototype[method] = builder({ handler: original });

      return () => {
        api.removeOverride(method);
      };
    },

    removeOverride<K extends FunctionKeys<XMLHttpRequest>>(method: K) {
      const original = originalRegistry.get(method);
      if (!original) return;

      XMLHttpRequest.prototype[method] = original;
      originalRegistry.delete(method);
    },

    getOriginal<
      K extends FunctionKeys<XMLHttpRequest>,
      Handler extends AnyFunction = XMLHttpRequest[K],
    >(method: K): Handler {
      const key = method as string;

      const cached = originalRegistry.get(key);
      if (cached) return cached as Handler;

      const value = XMLHttpRequest.prototype[method];
      if (!isFunction(value)) return value as Handler;

      originalRegistry.set(key, value);

      return value as Handler;
    },
  };

  return api;
})();

type Unsubscribe = () => void;

type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends AnyFunction ? K : never;
}[keyof T];

export default xmlHttpRequestEnvelop;
