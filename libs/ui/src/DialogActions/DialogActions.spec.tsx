import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DialogActions from './index';
import Button from '../Button';

describe('DialogActions', () => {
  it('handles button interactions', () => {
    const handleCancel = vi.fn();
    const handleSave = vi.fn();

    render(
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const saveButton = screen.getByRole('button', { name: 'Save' });

    fireEvent.click(cancelButton);
    expect(handleCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('applies custom sx props', () => {
    render(
      <DialogActions
        sx={{ padding: 3, justifyContent: 'center' }}
        data-testid="styled-dialog-actions"
      >
        <Button>OK</Button>
      </DialogActions>
    );

    const dialogActions = screen.getByTestId('styled-dialog-actions');
    expect(dialogActions).toBeInTheDocument();
    expect(dialogActions).toHaveClass('MuiDialogActions-root');
  });

  it('renders within Dialog context', () => {
    render(
      <div role="dialog">
        <div>Dialog content here</div>
        <DialogActions>
          <Button>Close</Button>
          <Button variant="contained">Confirm</Button>
        </DialogActions>
      </div>
    );

    expect(screen.getByText('Dialog content here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('handles empty content', () => {
    render(<DialogActions data-testid="empty-dialog-actions" />);

    const dialogActions = screen.getByTestId('empty-dialog-actions');
    expect(dialogActions).toBeInTheDocument();
    expect(dialogActions).toHaveClass('MuiDialogActions-root');
  });

  it('renders with multiple action types', () => {
    render(
      <DialogActions>
        <Button color="secondary">Cancel</Button>
        <Button color="error">Delete</Button>
        <Button variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
