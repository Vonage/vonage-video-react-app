import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import AdvancedSettingsStatisticsGroup from './AdvancedSettingsStatisticsGroup';

describe('AdvancedSettingsStatisticsGroup', () => {
  it('renders empty state when there are no statistics', () => {
    render(
      <AdvancedSettingsStatisticsGroup
        title="Publisher"
        audioTitle="Audio"
        videoTitle="Video"
        audioItems={[]}
        videoItems={[]}
        emptyLabel="No statistics available yet"
        defaultExpanded
      />
    );

    expect(screen.getByRole('button', { name: /publisher/i })).toBeInTheDocument();
    expect(screen.getByText(/no statistics available yet/i)).toBeInTheDocument();
  });

  it('renders both audio and video statistics sections when data exists', () => {
    render(
      <AdvancedSettingsStatisticsGroup
        title="Publisher"
        audioTitle="Audio"
        videoTitle="Video"
        audioItems={[{ label: 'Packets sent', value: '--' }]}
        videoItems={[{ label: 'Bytes received', value: '1.2 Mbps' }]}
        emptyLabel="No statistics available yet"
        defaultExpanded
      />
    );

    expect(screen.getByRole('heading', { name: /audio/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByText(/packets sent/i)).toBeInTheDocument();
    expect(screen.getByText(/bytes received/i)).toBeInTheDocument();
  });

  it('collapses and expands the group body', async () => {
    const user = userEvent.setup();

    render(
      <AdvancedSettingsStatisticsGroup
        title="Publisher"
        audioTitle="Audio"
        videoTitle="Video"
        audioItems={[{ label: 'Packets sent', value: '--' }]}
        videoItems={[]}
        emptyLabel="No statistics available yet"
        defaultExpanded
      />
    );

    const toggleButton = screen.getByRole('button', { name: /publisher/i });
    const statisticsItem = screen.getByText(/packets sent/i);

    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(statisticsItem).not.toBeVisible();

    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(statisticsItem).toBeVisible();
  });
});
