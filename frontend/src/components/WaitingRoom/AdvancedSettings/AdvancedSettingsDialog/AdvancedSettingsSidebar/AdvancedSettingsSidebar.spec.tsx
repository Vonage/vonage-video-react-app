import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsSidebar from './AdvancedSettingsSidebar';

describe('AdvancedSettingsSidebar', () => {
  it('renders all tabs', () => {
    render(<AdvancedSettingsSidebar selectedTab="general" setSelectedTab={() => {}} />);

    expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /audio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /statistics/i })).toBeInTheDocument();
  });

  it('calls setSelectedTab when clicking another tab', async () => {
    const user = userEvent.setup();
    const setSelectedTab = vi.fn();

    render(<AdvancedSettingsSidebar selectedTab="general" setSelectedTab={setSelectedTab} />);

    await user.click(screen.getByRole('button', { name: /statistics/i }));

    expect(setSelectedTab).toHaveBeenCalledWith('statistics');
  });
});
