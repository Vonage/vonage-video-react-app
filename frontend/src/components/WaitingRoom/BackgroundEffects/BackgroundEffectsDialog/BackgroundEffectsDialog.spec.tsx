import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BackgroundEffectsDialog from './BackgroundEffectsDialog';

vi.mock('../../../../hooks/useBackgroundPublisherContext', () => ({
  __esModule: true,
  default: () => ({
    publisherVideoElement: null,
    changeBackground: vi.fn(),
  }),
}));

describe('BackgroundEffectsDialog', () => {
  it('renders dialog when open', () => {
    render(<BackgroundEffectsDialog backgroundEffectsOpen setBackgroundEffectsOpen={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/background effects/i)).toBeInTheDocument();
  });

  it('does not render dialog when closed', () => {
    const { queryByRole } = render(
      <BackgroundEffectsDialog backgroundEffectsOpen={false} setBackgroundEffectsOpen={() => {}} />
    );
    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls setBackgroundEffectsOpen(false) on close', async () => {
    const setBackgroundEffectsOpen = vi.fn();
    render(
      <BackgroundEffectsDialog
        backgroundEffectsOpen
        setBackgroundEffectsOpen={setBackgroundEffectsOpen}
      />
    );
    const backdrop = document.querySelector('.MuiBackdrop-root');
    expect(backdrop).toBeTruthy();
    await userEvent.click(backdrop!);
    expect(setBackgroundEffectsOpen).toHaveBeenCalledWith(false);
  });
});
