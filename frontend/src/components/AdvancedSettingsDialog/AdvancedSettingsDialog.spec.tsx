import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import advancedSettingsDialog$ from '@Context/AdvancedSettingsDialog';
import AdvancedSettingsDialog from './AdvancedSettingsDialog';

describe('AdvancedSettingsDialog', () => {
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

    expect(screen.getByRole('heading', { name: /bitrate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /codec/i })).toBeInTheDocument();
  });

  it('switches to the audio tab', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsDialog />);

    await user.click(screen.getByRole('button', { name: /audio/i }));

    expect(screen.getByRole('heading', { name: /^audio$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /audio bitrate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /enable opus dtx/i })).toBeInTheDocument();
  });

  it('switches to the statistics tab', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsDialog />);

    await user.click(screen.getByRole('button', { name: /statistics/i }));

    expect(screen.getByRole('heading', { name: /^statistics$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /enable publisher statistics/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publisher/i })).toBeInTheDocument();
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
  return renderBase(ui, { wrapper: AdvancedSettingsDialogTestProvider });
}

function AdvancedSettingsDialogTestProvider({ children }: { children: ReactNode }): ReactElement {
  return (
    <advancedSettingsDialog$.Provider value={{ isOpen: true }}>
      {children}
    </advancedSettingsDialog$.Provider>
  );
}
