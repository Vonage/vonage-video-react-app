import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
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
