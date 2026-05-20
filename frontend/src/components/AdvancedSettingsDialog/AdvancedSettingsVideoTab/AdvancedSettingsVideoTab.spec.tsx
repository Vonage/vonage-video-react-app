import { render as renderBase, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { advancedSettings } from '@Context/AdvancedSettings';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsVideoTab from './AdvancedSettingsVideoTab';

type RenderOptions = {
  dialogState?: Partial<advancedSettings>;
};

describe('AdvancedSettingsVideoTab', () => {
  afterEach(() => {
    advancedSettings$.reset();
  });

  it('renders all video sections', () => {
    render(<AdvancedSettingsVideoTab />);

    expect(screen.getByRole('heading', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/bitrate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/codec/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frame rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/resolution/i)).toBeInTheDocument();
  });

  it('renders codec priority drag and drop when codec mode is manual', () => {
    render(<AdvancedSettingsVideoTab />, {
      dialogState: { codecMode: 'manual', codecPriority: ['vp9', 'vp8', 'h264'] },
    });

    expect(screen.getByText(/codec priority/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp9')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp8')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-h264')).toBeInTheDocument();
  });

  it('renders custom video bitrate controls when bitrate mode is custom', () => {
    render(<AdvancedSettingsVideoTab />, { dialogState: { bitrateMode: 'custom' } });

    expect(screen.getByText(/custom bitrate/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-custom-video-bitrate-slider')).toBeInTheDocument();
    expect(screen.getAllByText(/5 kbps/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^10 Mbps$/i)).toBeInTheDocument();
  });
});

function render(ui: ReactElement, { dialogState }: RenderOptions = {}) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  return renderBase(ui);
}
