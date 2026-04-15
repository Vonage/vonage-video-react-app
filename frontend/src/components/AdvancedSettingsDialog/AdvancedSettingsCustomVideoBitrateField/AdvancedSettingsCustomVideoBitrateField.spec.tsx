import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsCustomVideoBitrateField from './AdvancedSettingsCustomVideoBitrateField';

describe('AdvancedSettingsCustomVideoBitrateField', () => {
  it('renders the current bitrate and range labels', () => {
    render(
      <AdvancedSettingsCustomVideoBitrateField
        customVideoBitrate={500_000}
        setCustomVideoBitrate={vi.fn()}
      />
    );

    expect(screen.getByText(/custom bitrate/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-custom-video-bitrate-slider')).toHaveAttribute(
      'type',
      'range'
    );
    expect(screen.getAllByText(/5 kbps/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^10 Mbps$/i)).toBeInTheDocument();
    expect(screen.getByText(/^500 kbps$/i)).toBeInTheDocument();
  });

  it('clamps the value into the supported range', () => {
    const setCustomVideoBitrate = vi.fn();

    render(
      <AdvancedSettingsCustomVideoBitrateField
        customVideoBitrate={9_995_000}
        setCustomVideoBitrate={setCustomVideoBitrate}
      />
    );

    fireEvent.change(screen.getByTestId('advanced-settings-custom-video-bitrate-slider'), {
      target: { value: '20000000' },
    });

    expect(setCustomVideoBitrate).toHaveBeenCalledWith(10_000_000);
  });
});
