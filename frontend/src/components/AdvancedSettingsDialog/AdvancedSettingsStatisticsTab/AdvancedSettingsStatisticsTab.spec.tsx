import { render as renderBase, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import AdvancedSettingsStatisticsTab from './AdvancedSettingsStatisticsTab';

describe('AdvancedSettingsStatisticsTab', () => {
  it('renders collection and an empty publisher statistics group', () => {
    render(<AdvancedSettingsStatisticsTab />);

    expect(screen.getByRole('heading', { name: /^statistics$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/enable publisher statistics/i)).toBeInTheDocument();
    expect(screen.getAllByText(/publisher/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/no statistics available yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/subscriber/i)).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  return renderBase(ui);
}
