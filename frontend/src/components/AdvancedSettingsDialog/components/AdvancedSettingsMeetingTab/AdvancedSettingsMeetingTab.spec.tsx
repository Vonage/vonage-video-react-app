import type { ReactElement } from 'react';
import { serverSettings$ } from '@core/stores';
import composeProviders from '@web/helpers/composeProviders';
import { fireEvent, render as renderBase, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { SessionKeyClaim } from '@common/constants';
import { makeTestProvider, providers } from '@test/providers';
import { env } from '../../../../env';
import AdvancedSettingsMeetingTab from './AdvancedSettingsMeetingTab';

const startsAt = new Date(2026, 10, 4, 15, 0).getTime();
const scheduleWindow = { startsAtMs: startsAt, endsAtMs: startsAt + 60 * 60_000 };
const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
const signedInHintCookie = 'vera-session-signed-in';

describe('AdvancedSettingsMeetingTab', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(scheduleWindow.endsAtMs - 4 * 60_000);
    env.partialUpdate({ AUTH_ENABLED: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    env.reset();
    document.cookie = `${signedInHintCookie}=; max-age=0`;
  });

  it('shows anonymous users the progress and asks them to sign in to extend', async () => {
    expect.assertions(3);

    render({ extendedMinutes: 0 });

    expect(await screen.findByText('4 min left')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '93');
    expect(screen.getByText('Sign in to extend this meeting.')).toBeInTheDocument();
  });

  it('says the meeting cannot be extended further at the cap', async () => {
    expect.assertions(2);
    document.cookie = `${signedInHintCookie}=1`;

    render({ extendedMinutes: 120 });

    expect(await screen.findByText('This meeting cannot be extended further.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Extend' })).not.toBeInTheDocument();
  });

  it('extends the meeting of a signed-in participant by the chosen minutes', async () => {
    expect.assertions(1);
    document.cookie = `${signedInHintCookie}=1`;

    const { videoClient, sessionKey } = render({ extendedMinutes: 0 });

    fireEvent.click(await screen.findByRole('button', { name: 'Extend' }));
    fireEvent.click(await screen.findByRole('button', { name: '40 min' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(videoClient.extendSession).toHaveBeenCalledWith({ sessionKey, minutes: 40 });
  });
});

function render({ extendedMinutes }: { extendedMinutes: number }) {
  const sessionKey = makeSessionKey({ extendedMinutes });
  const videoClient = makeVideoClientMock({
    getServerSettings: () =>
      Promise.resolve({ serverTime: Date.now(), extension: { options: [20, 40, 60] } }),
    extendSession: () => new Promise(() => {}),
  });
  const { wrapper } = makeTestProvider([providers.runtime, providers.user, providers.session], {
    runtimeContext: { videoClient },
    userContext: undefined,
    sessionContext: { initialValue: { sessionKey } },
  });
  const ui: ReactElement = <AdvancedSettingsMeetingTab scheduleWindow={scheduleWindow} />;

  renderBase(ui, {
    wrapper: composeProviders(
      wrapper,
      serverSettings$.Provider.makeProviderWrapper({ sessionKey: null }).wrapper
    ),
  });

  return { videoClient, sessionKey };
}

function makeSessionKey({ extendedMinutes }: { extendedMinutes: number }): string {
  const payload = {
    sessionId,
    [SessionKeyClaim.schedule]: scheduleWindow,
    [SessionKeyClaim.extended]: extendedMinutes,
  };
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=+$/, '');
  return `eyJhbGciOiJIUzI1NiJ9.${encodedPayload}.signature`;
}
