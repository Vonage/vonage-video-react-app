import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsDialog from './AdvancedSettingsDialog';

describe('AdvancedSettingsDialog', () => {
  beforeEach(() => {
    advancedSettings$.setState((state) => ({ ...state, isOpen: true }));
  });

  afterEach(() => {
    advancedSettings$.reset();
  });

  it('renders dialog when open', async () => {
    render(<AdvancedSettingsDialog />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText(/^settings$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
  });

  it('switches to the video tab', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsDialog />);

    await user.click(screen.getByRole('button', { name: /video/i }));

    expect(screen.getByLabelText(/bitrate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/codec/i)).toBeInTheDocument();
  });

  it('switches to the audio tab', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsDialog />);

    await user.click(screen.getByRole('button', { name: /audio/i }));

    expect(screen.getByRole('heading', { name: /^audio$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/audio bitrate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/enable opus dtx/i)).toBeInTheDocument();
  });

  it('switches to the statistics tab', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsDialog />);

    await user.click(screen.getByRole('button', { name: /statistics/i }));

    expect(screen.getByRole('heading', { name: /^statistics$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/enable publisher bandwidth estimate/i)).toBeInTheDocument();
    expect(screen.getAllByText(/publisher/i).length).toBeGreaterThan(0);
  });

  it('closes the dialog through context on close', async () => {
    render(<AdvancedSettingsDialog />);

    await userEvent.click(screen.getByLabelText(/close/i));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

function render(ui: ReactElement) {
  return renderBase(<MemoryRouter initialEntries={['/waiting-room']}>{ui}</MemoryRouter>);
}
