import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DialogTitle from './index';

describe('DialogTitle', () => {
  it('renders correctly', () => {
    render(<DialogTitle>Dialog Title Text</DialogTitle>);

    const dialogTitle = screen.getByText('Dialog Title Text');
    expect(dialogTitle).toBeInTheDocument();
    expect(dialogTitle).toHaveClass('MuiDialogTitle-root');
  });

  it('renders with different typography variants', () => {
    render(<DialogTitle data-testid="dialog-title">Important Dialog</DialogTitle>);

    const dialogTitle = screen.getByTestId('dialog-title');
    expect(dialogTitle).toBeInTheDocument();
    expect(dialogTitle).toHaveClass('MuiDialogTitle-root');
  });

  it('renders within Dialog context', () => {
    render(
      <div role="dialog">
        <DialogTitle>Confirmation</DialogTitle>
        <div>Are you sure you want to proceed?</div>
      </div>
    );

    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('handles empty content', () => {
    render(<DialogTitle data-testid="empty-dialog-title" />);

    const dialogTitle = screen.getByTestId('empty-dialog-title');
    expect(dialogTitle).toBeInTheDocument();
    expect(dialogTitle).toHaveClass('MuiDialogTitle-root');
  });

  it('renders with long text content', () => {
    const longTitle =
      'This is a very long dialog title that might wrap to multiple lines in the user interface when displayed';

    render(<DialogTitle>{longTitle}</DialogTitle>);

    const dialogTitle = screen.getByText(longTitle);
    expect(dialogTitle).toBeInTheDocument();
  });

  it('renders as different HTML elements', () => {
    render(
      <DialogTitle component="h2" data-testid="h2-dialog-title">
        H2 Dialog Title
      </DialogTitle>
    );

    const dialogTitle = screen.getByTestId('h2-dialog-title');
    expect(dialogTitle.tagName).toBe('H2');
    expect(dialogTitle).toHaveTextContent('H2 Dialog Title');
  });
});
