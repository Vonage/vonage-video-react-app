import React, { createContext, useContext } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import composeProviders from './composeProviders';

describe('composeProviders', () => {
  it('should nest multiple providers and make context values accessible', () => {
    const Context1 = createContext('default1');
    const Context2 = createContext('default2');

    const Provider1: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Context1.Provider value="value1">{children}</Context1.Provider>
    );
    const Provider2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Context2.Provider value="value2">{children}</Context2.Provider>
    );

    const Consumer = () => (
      <div data-testid="consumer">{`${useContext(Context1)}-${useContext(Context2)}`}</div>
    );

    const ComposedProvider = composeProviders(Provider1, Provider2);

    render(
      <ComposedProvider>
        <Consumer />
      </ComposedProvider>
    );

    expect(screen.getByTestId('consumer').textContent).toBe('value1-value2');
  });
});
