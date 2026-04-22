import { isFunction } from '@common/assertions';
import type { AnyFunction, ObjectKeys } from '@common/types';

/**
 * Methods accessed through the proxy are wrapped so their execution can be
 * dynamically redirected to registered overrides, even when destructured.
 *
 * Overrides are defined via a builder that receives the original target and a
 * pre-bound version of the method, and must return a replacement function.
 *
 * Original methods retain their native behavior and binding.
 */
const interceptObject = <
  Envelop extends object,
  Key extends ObjectKeys<Envelop>,
  Target extends object = Envelop[Key] extends object ? Envelop[Key] : never,
>(
  container: Envelop,
  target: Key
) => {
  let targetObj = container[target] as Target;

  const overrideRegistry = new Map<string, AnyFunction>();
  const originalRegistry = new Map<string, AnyFunction>();
  let functionCache = new WeakMap<AnyFunction, AnyFunction>();

  const proxy = targetObj
    ? new Proxy(targetObj, {
        get(proxyTarget, prop): unknown {
          // Use the real target as `this` for property access to avoid
          // "Illegal invocation" from native getters that perform brand checks
          // (e.g. MediaDevices.ondevicechange in Firefox).
          const value = Reflect.get(proxyTarget, prop, proxyTarget);
          const methodName = String(prop);

          if (!isFunction(value)) return value;

          const typedValue = value as AnyFunction;

          if (functionCache.has(typedValue)) return functionCache.get(typedValue);

          if (!originalRegistry.has(methodName)) {
            originalRegistry.set(methodName, typedValue.bind(proxyTarget));
          }

          const wrapped: AnyFunction = function (...args: unknown[]): unknown {
            const registeredOverride = overrideRegistry.get(methodName);
            if (registeredOverride) return registeredOverride(...args);

            return typedValue.apply(proxyTarget, args);
          };

          functionCache.set(typedValue, wrapped);

          return wrapped;
        },
      })
    : null;

  if (targetObj) {
    // Replace the original object with the proxy in the container
    Object.defineProperty(container, target, {
      value: proxy,
      configurable: true,
      writable: true,
    });
  }

  return {
    proxy,
    override<
      K extends keyof Target,
      Handler extends AnyFunction = Target[K] extends AnyFunction ? Target[K] : never,
    >(
      method: K,
      builder: (args: {
        target: Target;
        handler: Handler;
      }) => (...args: Parameters<Handler>) => ReturnType<Handler>
    ): Unsubscribe {
      const original = this.getOriginal(method) as unknown as Handler;
      const handler = builder({ target: targetObj, handler: original });

      overrideRegistry.set(method as string, handler as AnyFunction);

      return () => {
        overrideRegistry.delete(method as string);
      };
    },
    removeOverride<K extends keyof Target>(method: K) {
      overrideRegistry.delete(method as string);
    },
    getOriginal<
      K extends keyof Target,
      Handler extends AnyFunction = Target[K] extends AnyFunction ? Target[K] : never,
    >(method: K): Handler {
      const cached = originalRegistry.get(method as string);
      if (cached) return cached as Handler;

      const value = targetObj?.[method];
      if (!isFunction(value)) return value as Handler;

      const bound = value.bind(targetObj) as Handler;
      originalRegistry.set(method as string, bound);

      return bound;
    },
    /**
     * Re-reads the target from the given container, clearing stale caches
     * while preserving registered overrides.
     *
     * Useful when the container reference is replaced after initialization
     * (e.g. `vi.stubGlobal` in tests replacing `navigator`).
     */
    rebind(freshContainer?: Envelop) {
      if (freshContainer) targetObj = freshContainer[target] as Target;

      originalRegistry.clear();
      functionCache = new WeakMap();
    },
  };
};

type Unsubscribe = () => void;

export default interceptObject;
