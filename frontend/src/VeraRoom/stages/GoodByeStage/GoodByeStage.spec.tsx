import { describe, expect, it } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import GoodByeStage from './GoodByeStage';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import composeProviders from '@web/helpers/composeProviders';
import { StrictMode, ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('GoodByeStage', () => {
  it('should render correctly with default props', () => {
    render(<GoodByeStage />);

    expect(screen.getByText('You have left the meeting')).toBeVisible();
    expect(screen.getByText('Thank you for joining!')).toBeVisible();
    expect(screen.getByText('Rejoining the room')).toBeVisible();
    expect(screen.getByText('Download recordings')).toBeVisible();
    expect(screen.getByText("The meeting hasn't been recorded")).toBeVisible();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function render(
  ui: ReactElement,
  { userContext, sessionContext, runtimeContext }: RenderOptions = {}
) {
  const { wrapper: ContextWrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      userContext,
      sessionContext,
      runtimeContext,
    }
  );

  const wrapper = composeProviders(StrictMode, MemoryRouter, ContextWrapper);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
