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

    await user.click(screen.getByRole('button', { name: /publisher/i }));

    expect(screen.queryByText(/packets sent/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /publisher/i }));

    expect(screen.getByText(/packets sent/i)).toBeInTheDocument();
  });
});
