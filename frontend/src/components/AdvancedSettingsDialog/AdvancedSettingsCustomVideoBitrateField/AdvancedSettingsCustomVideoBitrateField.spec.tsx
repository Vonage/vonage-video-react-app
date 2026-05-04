import { fireEvent, render as renderBase, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { makeTestProvider, providers } from '@test/providers';
import type { AdvancedSettingsDialogState } from '@Context/AdvancedSettings';
import AdvancedSettingsCustomVideoBitrateField from './AdvancedSettingsCustomVideoBitrateField';

describe('AdvancedSettingsCustomVideoBitrateField', () => {
  it('renders the current bitrate and range labels', () => {
    render(<AdvancedSettingsCustomVideoBitrateField />);

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
    render(<AdvancedSettingsCustomVideoBitrateField />, {
      dialogState: { customVideoBitrate: 9_995_000 },
    });

    const slider = screen.getByTestId('advanced-settings-custom-video-bitrate-slider');

    fireEvent.change(slider, { target: { value: '20000000' } });

    expect(slider).toHaveValue('10000000');
  });
});

type RenderOptions = {
  dialogState?: Partial<AdvancedSettingsDialogState>;
};

function render(ui: ReactElement, { dialogState }: RenderOptions = {}) {
  const { wrapper } = makeTestProvider([providers.advancedSettings], {
    advancedSettingsContext: { dialogState },
  });

  return renderBase(ui, { wrapper });
}
