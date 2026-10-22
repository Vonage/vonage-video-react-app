import { type Mockable, SPY_MARK } from '@common/types/Mockable';
import type * as module from '@vonage/auth';
import { vi } from 'vitest';
import { isFunction } from '@common/assertions';
import { mockModule, setupPartialMock } from '@common-test/helpers';

type Module = typeof module;

type AuthInstance = InstanceType<Module['Auth']>;

export type AuthMock = Partial<
  Omit<Mockable<Module>, 'Auth'> & {
    Auth?:
      | Mockable<AuthInstance>
      | ((args: {
          instance: AuthInstance;
          spyOn: (mocks: Mockable<AuthInstance>) => void;
        }) => void);
  }
>;

/**
 * @example
 * ```ts
 * vi.mock('@vonage/auth', async () => {
 *   const actual = await vi.importActual('@vonage/auth');
 *
 *   return mockAuthModule(actual, {
 *     Auth: {
 *       getQueryParams: { foo: 'bar' }
 *     },
 *   });
 * });
 * ```
 */
const mockAuthModule = <T extends Mockable<Module>>(
  actual: Module,
  mock: T | ((spy: typeof SPY_MARK) => T)
): Module => {
  const mock$ = (isFunction(mock) ? mock(SPY_MARK) : mock) as AuthMock;
  const { Auth, ...rest } = mock$;

  const Auth$ = (() => {
    if (!mock$.Auth) return actual.Auth;

    const OriginalAuth = actual.Auth;

    return vi.fn((...args: ConstructorParameters<Module['Auth']>) => {
      const instance = new OriginalAuth(...args);
      const spyOn = (mocks: Mockable<AuthInstance>) => {
        setupPartialMock<AuthInstance>('Auth instance', instance, mocks);
      };

      if (!isFunction(mock$.Auth)) {
        return spyOn(Auth as Mockable<AuthInstance>);
      }

      mock$.Auth({ instance, spyOn });

      return instance;
    });
  })();

  return mockModule<Module>({ ...actual, Auth: Auth$ } as Module, rest);
};

export default mockAuthModule;
