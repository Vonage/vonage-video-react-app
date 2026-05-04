import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LowerAllDialog from './LowerAllDialog';

describe('LowerAllDialog', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDialog = (props: Partial<React.ComponentProps<typeof LowerAllDialog>> = {}) =>
    render(
      <LowerAllDialog
        open
        raisedHandCount={3}
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      />
    );

  it('does not mount the dialog content when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByTestId('lower-all-dialog')).not.toBeInTheDocument();
  });

  it('renders the title, body and both action buttons when open', () => {
    renderDialog();
    expect(screen.getByTestId('lower-all-dialog')).toBeInTheDocument();
    // Title (with question mark) — there's a second match on the confirm
    // button label, hence the strict trailing question-mark.
    expect(screen.getByText(/lower all hands\?/i)).toBeInTheDocument();
    expect(screen.getByTestId('lower-all-cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('lower-all-confirm-button')).toBeInTheDocument();
  });

  it('interpolates the raisedHandCount into the body copy', () => {
    renderDialog({ raisedHandCount: 1 });
    expect(screen.getByText(/this will lower 1 raised hand/i)).toBeInTheDocument();
  });

  it('updates the body copy when the count changes', () => {
    const { rerender } = renderDialog({ raisedHandCount: 1 });
    expect(screen.getByText(/this will lower 1 raised hand/i)).toBeInTheDocument();

    rerender(<LowerAllDialog open raisedHandCount={4} onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByText(/this will lower 4 raised hand/i)).toBeInTheDocument();
  });

  it('invokes onConfirm exactly once when the confirm button is clicked', () => {
    renderDialog();
    fireEvent.click(screen.getByTestId('lower-all-confirm-button'));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('invokes onCancel exactly once when the cancel button is clicked', () => {
    renderDialog();
    fireEvent.click(screen.getByTestId('lower-all-cancel-button'));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('invokes onCancel when the user presses Escape (MUI default close)', () => {
    renderDialog();
    fireEvent.keyDown(screen.getByTestId('lower-all-dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('autofocuses the confirm button so Enter confirms by default', () => {
    renderDialog();
    expect(screen.getByTestId('lower-all-confirm-button')).toHaveFocus();
  });

  it('exposes the dialog title via aria-labelledby for screen readers', () => {
    renderDialog();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'lower-all-dialog-title');
    expect(document.getElementById('lower-all-dialog-title')).toBeInTheDocument();
  });
});
