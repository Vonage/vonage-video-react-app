import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DialogActionsRow from './DialogActionsRow';

describe('DialogActionsRow', () => {
  it('renders close and primary buttons with provided labels', () => {
    render(
      <DialogActionsRow
        closeButtonText="Close"
        onClose={() => {}}
        actionButtonText="Retry"
        onActionClick={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('calls handlers when buttons are clicked', async () => {
    const onClose = vi.fn();
    const onActionClick = vi.fn();

    render(
      <DialogActionsRow
        closeButtonText="Close"
        onClose={onClose}
        actionButtonText="Retry"
        onActionClick={onActionClick}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onActionClick).toHaveBeenCalledTimes(1);
  });
});
