import { afterEach, describe, expect, it } from 'vitest';
import { env } from '../../env';
import { render as renderBase, screen } from '@testing-library/react';
import GoodBye from './index';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import composeProviders from '@web/helpers/composeProviders';
import { StrictMode, ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('GoodBye', () => {
  afterEach(() => {
    env.reset();
    document.cookie = 'vera-session-signed-in=; max-age=0';
  });

  it('should render correctly with default props', () => {
    render(<GoodBye />);

    expect(screen.getByText('You have left the meeting')).toBeVisible();
    expect(screen.getByText('Thank you for joining!')).toBeVisible();
    expect(screen.getByText('Rejoining the room')).toBeVisible();
    expect(screen.getByRole('button', { name: 'View Landing Page' })).toBeVisible();
    expect(screen.getByText('Download session content')).toBeVisible();
    expect(screen.getByText('This session has no content to download')).toBeVisible();
  });

  it.each([
    { scenario: 'nobody is signed in', cookie: '', isShown: false },
    { scenario: 'signed in', cookie: 'vera-session-signed-in=1', isShown: true },
  ])('shows the landing page link: $isShown when $scenario', ({ cookie, isShown }) => {
    env.partialUpdate({ AUTH_ENABLED: true });
    document.cookie = cookie;

    render(<GoodBye />);

    expect(!!screen.queryByRole('button', { name: 'View Landing Page' })).toBe(isShown);
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
