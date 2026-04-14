import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsStatisticsTab from './AdvancedSettingsStatisticsTab';

describe('AdvancedSettingsStatisticsTab', () => {
  it('renders collection and an empty publisher statistics group', () => {
    render(
      <AdvancedSettingsStatisticsTab
        publisherStatisticsEnabled={false}
        setPublisherStatisticsEnabled={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /^statistics$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /enable publisher statistics/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publisher/i })).toBeInTheDocument();
    expect(screen.getByText(/no statistics available yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subscriber/i })).not.toBeInTheDocument();
  });
});
