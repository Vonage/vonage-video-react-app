import { afterEach, describe, expect, it } from 'vitest';
import { env } from '../../env';
import { render as renderBase, screen, waitFor } from '@testing-library/react';
import GoodBye from './index';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import composeProviders from '@web/helpers/composeProviders';
import { StrictMode, ReactElement } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { makeVideoClientMock } from '@core-test/fixtures';
import { SessionKeyClaim } from '@common/constants';
import { QueryClient } from '@tanstack/react-query';
import { coreQueryKeys } from '@core/constants';

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
    { minutesUntilEnd: -10, shouldShowReenter: false },
    { minutesUntilEnd: 10, shouldShowReenter: true },
  ])(
    'derives re-entry from the bookmarked URL with $minutesUntilEnd minutes left',
    async ({ minutesUntilEnd, shouldShowReenter }) => {
      expect.assertions(2);
      const payload = {
        sessionId: '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE',
        [SessionKeyClaim.schedule]: {
          startsAtMs: Date.now() - 60 * 60_000,
          endsAtMs: Date.now() + minutesUntilEnd * 60_000,
        },
      };
      const sessionKey = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.signature`;
      const queryClient = new QueryClient();
      render(
        <MemoryRouter initialEntries={[`/goodbye/${sessionKey}`]}>
          <Routes>
            <Route path="/goodbye/:roomIdentifier" element={<GoodBye />} />
          </Routes>
        </MemoryRouter>,
        {
          hasRouter: true,
          runtimeContext: {
            queryClient,
            videoClient: makeVideoClientMock({
              getServerSettings: () => Promise.resolve({ serverTime: Date.now() }),
            }),
          },
        }
      );
      await waitFor(() => {
        if (!queryClient.getQueryData(coreQueryKeys.serverSettings({ sessionKey }))) {
          throw new Error('Server time is pending');
        }
      });
      expect(await screen.findByText('Download session content')).toBeVisible();
      if (shouldShowReenter) {
        expect(await screen.findByRole('button', { name: 'Go back to meeting' })).toBeVisible();
        return;
      }
      expect(screen.queryByRole('button', { name: 'Go back to meeting' })).not.toBeInTheDocument();
    }
  );

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
  hasRouter?: boolean;
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function render(
  ui: ReactElement,
  { userContext, sessionContext, runtimeContext, hasRouter = false }: RenderOptions = {}
) {
  const { wrapper: ContextWrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      userContext,
      sessionContext,
      runtimeContext,
    }
  );

  const wrapper = hasRouter
    ? composeProviders(StrictMode, ContextWrapper)
    : composeProviders(StrictMode, MemoryRouter, ContextWrapper);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
