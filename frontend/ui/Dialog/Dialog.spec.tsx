import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DialogTitle from '@ui/DialogTitle';
import DialogContent from '@ui/DialogContent';
import DialogActions from '@ui/DialogActions';
import Button from '@ui/Button';
import Dialog from './index';

describe('Dialog', () => {
  it('renders correctly when open', () => {
    render(
      <Dialog open>
        <DialogTitle>Test Dialog</DialogTitle>
        <DialogContent>This is the dialog content.</DialogContent>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('This is the dialog content.')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Dialog open={false}>
        <DialogTitle>Hidden Dialog</DialogTitle>
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden Dialog')).not.toBeInTheDocument();
  });

  it('handles close events', () => {
    const handleClose = vi.fn();

    render(
      <Dialog open onClose={handleClose}>
        <DialogTitle>Closable Dialog</DialogTitle>
        <DialogContent>Content here</DialogContent>
      </Dialog>
    );

    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('renders with action buttons', () => {
    const handleCancel = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <Dialog open>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>Are you sure you want to continue?</DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });

    expect(cancelButton).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('renders fullscreen dialog', () => {
    render(
      <Dialog open fullScreen data-testid="fullscreen-dialog">
        <DialogTitle>Fullscreen Dialog</DialogTitle>
        <DialogContent>This dialog takes up the full screen.</DialogContent>
      </Dialog>
    );

    const dialog = screen.getByTestId('fullscreen-dialog');
    expect(dialog).toBeInTheDocument();
  });
});
