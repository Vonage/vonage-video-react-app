import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsDialog from './AdvancedSettingsDialog';

describe('AdvancedSettingsDialog', () => {
  it('renders dialog when open', async () => {
    render(<AdvancedSettingsDialog isAdvancedSettingsOpen setIsAdvancedSettingsOpen={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText(/^settings$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
  });

  it('switches to the video tab', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsDialog isAdvancedSettingsOpen setIsAdvancedSettingsOpen={() => {}} />);

    await user.click(screen.getByRole('button', { name: /video/i }));

    expect(screen.getByRole('heading', { name: /bitrate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /codec/i })).toBeInTheDocument();
  });

  it('calls setAdvancedSettingsOpen(false) on close', async () => {
    const setAdvancedSettingsOpen = vi.fn();
    render(
      <AdvancedSettingsDialog
        isAdvancedSettingsOpen
        setIsAdvancedSettingsOpen={setAdvancedSettingsOpen}
      />
    );

    await userEvent.click(screen.getByLabelText(/close/i));

    expect(setAdvancedSettingsOpen).toHaveBeenCalledWith(false);
  });
});

function render(ui: ReactElement) {
  return renderBase(ui);
}
