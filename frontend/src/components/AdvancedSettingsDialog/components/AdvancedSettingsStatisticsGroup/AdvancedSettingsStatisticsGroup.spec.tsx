import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AdvancedSettingsStatisticsGroup from './AdvancedSettingsStatisticsGroup';

describe('AdvancedSettingsStatisticsGroup', () => {
  it('renders only the statistics sections that have items', () => {
    render(
      <AdvancedSettingsStatisticsGroup
        title="Publisher"
        audioItems={[]}
        videoItems={[{ label: 'Bytes received', value: '1.2 Mbps' }]}
        networkItems={[]}
        defaultExpanded
      />
    );

    expect(screen.getAllByText(/publisher/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: /audio/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByText(/bytes received/i)).toBeInTheDocument();
  });

  it('renders network items when provided', () => {
    render(
      <AdvancedSettingsStatisticsGroup
        title="Subscriber"
        audioItems={[]}
        videoItems={[]}
        networkItems={[{ label: 'Network condition', value: 'Good' }]}
        defaultExpanded
      />
    );

    expect(screen.getByRole('heading', { name: /network/i })).toBeInTheDocument();
    expect(screen.getByText(/network condition/i)).toBeInTheDocument();
    expect(screen.getByText(/good/i)).toBeInTheDocument();
  });

  it('renders disabled message instead of network items when networkDisabledMessage is provided', () => {
    const disabledMessage = 'Network condition stats require both audio fallbacks enabled.';

    render(
      <AdvancedSettingsStatisticsGroup
        title="Subscriber"
        audioItems={[{ label: 'Packets received', value: '100' }]}
        videoItems={[]}
        networkItems={[]}
        networkDisabledMessage={disabledMessage}
        defaultExpanded
      />
    );

    expect(screen.getByText(disabledMessage)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /network/i })).not.toBeInTheDocument();
  });
});
