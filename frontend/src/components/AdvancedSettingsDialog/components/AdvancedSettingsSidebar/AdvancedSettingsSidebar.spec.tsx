import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { makeVideoClientMock } from '@core-test/fixtures';
import { SessionKeyClaim } from '@common/constants';
import { makeTestProvider, providers } from '@test/providers';
import { env } from '../../../../env';
import AdvancedSettingsSidebar from './AdvancedSettingsSidebar';

describe('AdvancedSettingsSidebar', () => {
  it('renders all tabs', () => {
    render(<AdvancedSettingsSidebar />);

    expect(screen.getByTestId('advanced-settings-tab-general')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-tab-video')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-tab-video-icon')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-tab-screenSharing')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-tab-screen-sharing-icon')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-tab-audio')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-tab-audio-icon')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-tab-statistics')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-tab-statistics-icon')).toBeInTheDocument();
  });

  describe('captions tab', () => {
    afterEach(() => {
      env.reset();
    });

    it('is shown when captions and caption translation are allowed', () => {
      env.partialUpdate({ ALLOW_CAPTIONS: true, ALLOW_CAPTION_TRANSLATION: true });

      render(<AdvancedSettingsSidebar />);

      expect(screen.getByTestId('advanced-settings-tab-captions')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-settings-tab-captions-icon')).toBeInTheDocument();
    });

    it('is hidden when captions are not allowed', () => {
      env.partialUpdate({ ALLOW_CAPTIONS: false, ALLOW_CAPTION_TRANSLATION: true });

      render(<AdvancedSettingsSidebar />);

      expect(screen.queryByTestId('advanced-settings-tab-captions')).not.toBeInTheDocument();
    });
  });

  describe('meeting tab', () => {
    it('is hidden outside a scheduled meeting', () => {
      render(<AdvancedSettingsSidebar />);

      expect(screen.queryByTestId('advanced-settings-tab-meeting')).not.toBeInTheDocument();
    });

    it('follows General in a scheduled meeting', () => {
      const { wrapper } = makeTestProvider([providers.runtime, providers.user, providers.session], {
        runtimeContext: { videoClient: makeVideoClientMock({}) },
        userContext: undefined,
        sessionContext: { initialValue: { sessionKey: makeScheduledSessionKey() } },
      });

      renderBase(<AdvancedSettingsSidebar />, { wrapper });

      const tabNames = screen.getAllByRole('button').map(({ textContent }) => textContent);
      expect(tabNames.slice(0, 2)).toEqual(['General', 'Meeting']);
    });
  });

  it('updates selected tab when clicking another tab', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsSidebar />);

    await user.click(screen.getByTestId('advanced-settings-tab-statistics'));

    expect(screen.getByTestId('advanced-settings-tab-statistics')).toHaveClass('bg-vera-surface');
  });
});

function render(ui: ReactElement) {
  return renderBase(ui);
}

function makeScheduledSessionKey(): string {
  const payload = {
    sessionId: '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE',
    [SessionKeyClaim.schedule]: { at: Math.floor(Date.now() / 1000), min: 60 },
  };
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=+$/, '');
  return `eyJhbGciOiJIUzI1NiJ9.${encodedPayload}.signature`;
}
