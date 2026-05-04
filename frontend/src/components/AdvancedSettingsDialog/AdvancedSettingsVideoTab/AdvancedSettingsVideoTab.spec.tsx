import { render as renderBase, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { makeTestProvider, providers } from '@test/providers';
import type { AdvancedSettingsDialogState } from '@Context/AdvancedSettings';
import AdvancedSettingsVideoTab from './AdvancedSettingsVideoTab';

type RenderOptions = {
  dialogState?: Partial<AdvancedSettingsDialogState>;
};

describe('AdvancedSettingsVideoTab', () => {
  it('renders all video sections', () => {
    render(<AdvancedSettingsVideoTab />);

    expect(screen.getByRole('heading', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bitrate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /codec/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /frame rate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /resolution/i })).toBeInTheDocument();
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
  const { wrapper } = makeTestProvider([providers.advancedSettings], {
    advancedSettingsContext: { dialogState },
  });

  return renderBase(ui, { wrapper });
}
