import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsStatisticsTab from './AdvancedSettingsStatisticsTab';

describe('AdvancedSettingsStatisticsTab', () => {
  it('renders collection and both statistics lists', () => {
    render(
      <AdvancedSettingsStatisticsTab
        publisherStatisticsEnabled={false}
        setPublisherStatisticsEnabled={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /^statistics$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /collection/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /enable publisher statistics/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /audio/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: /video/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/packets sent/i).length).toBe(2);
  });
});
