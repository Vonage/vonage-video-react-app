import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DialogContentText from './index';

describe('DialogContentText', () => {
  it('renders correctly', () => {
    render(<DialogContentText>This is the dialog content text</DialogContentText>);

    const dialogContentText = screen.getByText('This is the dialog content text');
    expect(dialogContentText).toBeInTheDocument();
    expect(dialogContentText).toHaveClass('MuiDialogContentText-root');
  });

  it('renders with different typography variants', () => {
    render(
      <DialogContentText variant="body2" data-testid="body2-text">
        Small body text
      </DialogContentText>
    );

    const dialogContentText = screen.getByTestId('body2-text');
    expect(dialogContentText).toBeInTheDocument();
    expect(dialogContentText).toHaveClass('MuiDialogContentText-root');
  });

  it('handles long text content', () => {
    const longText =
      'This is a very long dialog content text that might wrap to multiple lines and should be properly displayed within the dialog content area. It can contain detailed information, explanations, or instructions for the user.';

    render(<DialogContentText>{longText}</DialogContentText>);

    const dialogContentText = screen.getByText(longText);
    expect(dialogContentText).toBeInTheDocument();
  });

  it('renders with different colors', () => {
    render(
      <DialogContentText color="error" data-testid="error-text">
        Error message text
      </DialogContentText>
    );

    const dialogContentText = screen.getByTestId('error-text');
    expect(dialogContentText).toBeInTheDocument();
    expect(dialogContentText).toHaveClass('MuiDialogContentText-root');
  });

  it('renders as different HTML elements', () => {
    render(
      <DialogContentText component="div" data-testid="div-content-text">
        Div content text
      </DialogContentText>
    );

    const dialogContentText = screen.getByTestId('div-content-text');
    expect(dialogContentText.tagName).toBe('DIV');
    expect(dialogContentText).toHaveTextContent('Div content text');
  });

  it('renders with text alignment', () => {
    render(
      <DialogContentText sx={{ textAlign: 'center' }} data-testid="centered-text">
        Centered dialog text
      </DialogContentText>
    );

    const dialogContentText = screen.getByTestId('centered-text');
    expect(dialogContentText).toBeInTheDocument();
    expect(dialogContentText).toHaveTextContent('Centered dialog text');
  });
});
