import { render as renderBase, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import AdvancedSettingsStatisticsTab from './AdvancedSettingsStatisticsTab';

describe('AdvancedSettingsStatisticsTab', () => {
  it('renders collection and an empty publisher statistics group', () => {
    render(<AdvancedSettingsStatisticsTab />);

    expect(screen.getByRole('heading', { name: /^statistics$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /enable publisher statistics/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publisher/i })).toBeInTheDocument();
    expect(screen.getByText(/no statistics available yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subscriber/i })).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  return renderBase(ui);
}
