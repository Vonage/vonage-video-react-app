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
        defaultExpanded
      />
    );

    expect(screen.getAllByText(/publisher/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: /audio/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByText(/bytes received/i)).toBeInTheDocument();
  });
});
