import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AdvancedSettingsStatisticsList from './AdvancedSettingsStatisticsList';

describe('AdvancedSettingsStatisticsList', () => {
  it('renders the title and all statistic items', () => {
    render(
      <AdvancedSettingsStatisticsList
        title="Audio"
        items={[
          { label: 'Packets sent', value: '--' },
          { label: 'Bytes sent', value: '128 kbps' },
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: /audio/i })).toBeInTheDocument();
    expect(screen.getByText(/packets sent/i)).toBeInTheDocument();
    expect(screen.getByText(/bytes sent/i)).toBeInTheDocument();
    expect(screen.getByText(/128 kbps/i)).toBeInTheDocument();
  });
});
