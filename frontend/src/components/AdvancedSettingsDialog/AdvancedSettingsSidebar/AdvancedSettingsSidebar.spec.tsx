import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import AdvancedSettingsSidebar from './AdvancedSettingsSidebar';

describe('AdvancedSettingsSidebar', () => {
  it('renders all tabs', () => {
    render(<AdvancedSettingsSidebar />);

    expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /audio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /statistics/i })).toBeInTheDocument();
  });

  it('updates selected tab when clicking another tab', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsSidebar />);

    await user.click(screen.getByRole('button', { name: /statistics/i }));

    expect(screen.getByRole('button', { name: /statistics/i })).toHaveClass('bg-vera-surface');
  });
});

function render(ui: ReactElement) {
  return renderBase(ui);
}
