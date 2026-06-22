import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { advancedSettings } from '@Context/AdvancedSettings';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsAudioTab from './AdvancedSettingsAudioTab';

describe('AdvancedSettingsAudioTab', () => {
  afterEach(() => {
    advancedSettings$.reset();
  });

  it('renders all audio controls with automatic bitrate selected by default', () => {
    render(<AdvancedSettingsAudioTab />);

    expect(screen.getByRole('heading', { name: /^audio$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/audio bitrate/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('automatic');
    expect(
      screen.queryByTestId('advanced-settings-custom-audio-bitrate-slider')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/enable opus dtx/i)).toBeChecked();
    expect(screen.getByLabelText(/publisher audio fallback/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subscriber audio fallback/i)).toBeInTheDocument();
  });

  it('renders the custom audio bitrate slider when custom mode is selected', () => {
    render(<AdvancedSettingsAudioTab />, { dialogState: { audioBitrateMode: 'custom' } });

    expect(screen.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeInTheDocument();
    expect(screen.getByText(/6 kbps/i)).toBeInTheDocument();
    expect(screen.getByText(/510 kbps/i)).toBeInTheDocument();
    expect(screen.getByText(/128 kbps/i)).toBeInTheDocument();
  });

  it('shows custom slider after selecting custom bitrate mode', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsAudioTab />);

    await user.selectOptions(screen.getByRole('combobox'), 'custom');

    expect(screen.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeInTheDocument();
  });

  it('toggles enable opus dtx checkbox', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsAudioTab />);

    await user.click(screen.getByRole('checkbox', { name: /enable opus dtx/i }));

    expect(screen.getByRole('checkbox', { name: /enable opus dtx/i })).not.toBeChecked();
  });
});
type RenderOptions = {
  dialogState?: Partial<advancedSettings>;
  initialPath?: string;
};
function render(
  ui: ReactElement,
  { dialogState, initialPath = '/waiting-room' }: RenderOptions = {}
) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  return renderBase(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);
}
