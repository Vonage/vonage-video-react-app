import {
  MemoryRouter,
  MemoryRouterProps,
  UNSAFE_NavigationContext,
  UNSAFE_LocationContext,
  UNSAFE_RouteContext,
} from 'react-router-dom';
import { type Context, PropsWithChildren, useContext } from 'react';
import { ProviderComponent } from '@web/helpers';

type MemoryRouterContext = {
  readonly navigation: ContextValue<typeof UNSAFE_NavigationContext>;
  readonly location: ContextValue<typeof UNSAFE_LocationContext>;
  readonly route: ContextValue<typeof UNSAFE_RouteContext>;
};

function makeMemoryRouterProviderWrapper(props: MemoryRouterProps = {}): {
  wrapper: ProviderComponent;
  context: { current: MemoryRouterContext };
} {
  const context = {
    current: undefined as unknown as MemoryRouterContext,
  };

  const Interceptor = () => {
    const navigationValue = useContext(UNSAFE_NavigationContext);
    const locationValue = useContext(UNSAFE_LocationContext);
    const routeValue = useContext(UNSAFE_RouteContext);

    // eslint-disable-next-line react-hooks/immutability
    context.current = {
      navigation: navigationValue,
      location: locationValue,
      route: routeValue,
    };

    return null;
  };

  const wrapper = ({ children }: PropsWithChildren) => {
    return (
      <MemoryRouter {...props}>
        <Interceptor />
        {children}
      </MemoryRouter>
    );
  };

  return {
    wrapper,
    context,
  };
}

type ContextValue<T> = T extends Context<infer Value> ? Value : never;

export default makeMemoryRouterProviderWrapper;
