import { fireEvent, render as renderBase, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { advancedSettings } from '@Context/AdvancedSettings';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsCustomVideoBitrateField from './AdvancedSettingsCustomVideoBitrateField';

describe('AdvancedSettingsCustomVideoBitrateField', () => {
  afterEach(() => {
    advancedSettings$.reset();
  });

  it('renders the current bitrate and range labels', () => {
    render(<AdvancedSettingsCustomVideoBitrateField onChange={vi.fn()} />);

    expect(screen.getByText(/custom bitrate/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-custom-video-bitrate-slider')).toHaveAttribute(
      'type',
      'range'
    );
    expect(screen.getAllByText(/5 kbps/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^10 Mbps$/i)).toBeInTheDocument();
    expect(screen.getByText(/^500 kbps$/i)).toBeInTheDocument();
  });

  it('calls onChange with the clamped value when slider exceeds the maximum', () => {
    const handleChange = vi.fn();

    render(<AdvancedSettingsCustomVideoBitrateField onChange={handleChange} />, {
      dialogState: { customVideoBitrate: 9_995_000 },
    });

    const slider = screen.getByTestId('advanced-settings-custom-video-bitrate-slider');

    fireEvent.change(slider, { target: { value: '20000000' } });

    expect(handleChange).toHaveBeenCalledWith(10_000_000);
  });
});

type RenderOptions = {
  dialogState?: Partial<advancedSettings>;
};

function render(ui: ReactElement, { dialogState }: RenderOptions = {}) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  return renderBase(ui);
}
