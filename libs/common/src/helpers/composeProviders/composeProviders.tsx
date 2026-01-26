import React from 'react';

type ProviderProps = { children: React.ReactNode };
type ProviderComponent = React.ComponentType<ProviderProps>;

/**
 * Composes multiple context providers into a single provider component.
 * @param {...ProviderComponent} providers - The provider components to compose.
 * @returns {ProviderComponent} - A single provider component that nests the given providers.
 */
function composeProviders(...providers: ProviderComponent[]): ProviderComponent {
  return ({ children }) => {
    return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children);
  };
}

export default composeProviders;
