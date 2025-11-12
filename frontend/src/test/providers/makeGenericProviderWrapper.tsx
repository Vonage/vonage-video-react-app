/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { PropsWithChildren, useContext } from 'react';

export type ContextInterceptorCallback<Context extends React.Context<any>> = (
  value: React.ContextType<Context>
) => void;

export type ContextCreatedCallback<Context extends React.Context<any>> = (
  value: React.ContextType<Context>
) => void;

export type GenericWrapperOptions<
  TProvider extends React.FunctionComponent<PropsWithChildren<any>>,
  TContext extends React.Context<any>,
> = {
  __interceptor?: ContextInterceptorCallback<TContext>;
  __onCreated?: ContextCreatedCallback<TContext>;
} & Omit<Parameters<TProvider>[0], 'children'>;

/**
 * Creates a generic provider wrapper for testing context providers.
 * The wrapper includes an interceptor to capture context values.
 * @param {React.FunctionComponent} ContextProvider - The context provider component.
 * @param {React.Context} context - The context to capture values from.
 * @param {object} [options] - The wrapper options.
 * @param {ContextInterceptorCallback} [options.__interceptor] - Callback called on each render with the current context value.
 * @param {ContextCreatedCallback} [options.__onCreated] - Callback called once when the context is first created.
 * @param {...any} [options.props] - Any additional props are passed through to the ContextProvider.
 * @returns {[React.FunctionComponent, { current: any | undefined }]} The provider wrapper and context value getter.
 */
function makeGenericProviderWrapper<
  TProvider extends React.FunctionComponent<PropsWithChildren<any>>,
  TContext extends React.Context<any>,
>(
  ContextProvider: TProvider,
  context: TContext,
  options?: GenericWrapperOptions<TProvider, TContext>
) {
  type ContextValue = React.ContextType<TContext>;

  /**
   * Get the last context value captured by the Interceptor.
   * @returns {ContextValue | null} The last context value or null if not yet captured.
   */
  const contextResult = {
    current: undefined as ContextValue,
  };

  let onCreated = options?.__onCreated ?? null;

  const Interceptor = () => {
    const contextValue = useContext(context);

    contextResult.current = contextValue;

    onCreated?.(contextValue);
    onCreated = null;

    options?.__interceptor?.(contextValue);

    return null;
  };

  /**
   * Wrapper component for the context provider.
   * Contains an interceptor to capture context values.
   * @param {object} props - The component props.
   * @param {React.ReactNode} props.children - The child components.
   * @returns {React.ReactElement} The provider wrapper component.
   */
  const ProviderWrapper = ({ children }: PropsWithChildren) => {
    return (
      <ContextProvider {...(options?.props as Parameters<TProvider>[0])}>
        <Interceptor />
        {children}
      </ContextProvider>
    );
  };

  return [ProviderWrapper, contextResult] as const;
}

export default makeGenericProviderWrapper;
