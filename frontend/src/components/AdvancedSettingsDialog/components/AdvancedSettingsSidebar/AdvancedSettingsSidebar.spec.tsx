import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
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
