import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Alert from '@ui/Alert';
import Snackbar from './index';

describe('Snackbar', () => {
  it('renders correctly when open', () => {
    render(<Snackbar open message="Test notification" />);

    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Snackbar open={false} message="Hidden notification" />);

    expect(screen.queryByText('Hidden notification')).not.toBeInTheDocument();
  });

  it('handles close events', async () => {
    const handleClose = vi.fn();

    render(
      <Snackbar
        open
        autoHideDuration={1000}
        onClose={handleClose}
        message="Auto close notification"
      />
    );

    // Wait for auto close
    await waitFor(
      () => {
        expect(handleClose).toHaveBeenCalled();
      },
      { timeout: 1500 }
    );
  });

  it('renders with different anchors', () => {
    const { rerender } = render(
      <Snackbar
        open
        message="Top center"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        data-testid="snackbar"
      />
    );

    const snackbar = screen.getByTestId('snackbar');
    expect(snackbar).toBeInTheDocument();

    rerender(
      <Snackbar
        open
        message="Bottom right"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        data-testid="snackbar"
      />
    );

    expect(screen.getByText('Bottom right')).toBeInTheDocument();
  });

  it('renders with Alert component', () => {
    render(
      <Snackbar open>
        <Alert severity="success">Success message</Alert>
      </Snackbar>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('handles resume and pause on hover', () => {
    const handleClose = vi.fn();

    render(
      <Snackbar
        open
        autoHideDuration={1000}
        onClose={handleClose}
        message="Hover to pause"
        data-testid="hoverable-snackbar"
      />
    );

    const snackbar = screen.getByTestId('hoverable-snackbar');

    fireEvent.mouseEnter(snackbar);
    fireEvent.mouseLeave(snackbar);

    expect(snackbar).toBeInTheDocument();
  });

  it('handles key prop for multiple snackbars', () => {
    const { rerender } = render(<Snackbar open key="first" message="First notification" />);

    expect(screen.getByText('First notification')).toBeInTheDocument();

    rerender(<Snackbar open key="second" message="Second notification" />);

    expect(screen.getByText('Second notification')).toBeInTheDocument();
  });
});
