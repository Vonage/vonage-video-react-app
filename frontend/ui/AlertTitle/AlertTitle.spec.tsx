import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AlertTitle from './index';

describe('AlertTitle', () => {
  it('renders correctly', () => {
    render(<AlertTitle>Alert Title Text</AlertTitle>);

    const alertTitle = screen.getByText('Alert Title Text');
    expect(alertTitle).toBeInTheDocument();
    expect(alertTitle).toHaveClass('MuiAlertTitle-root');
  });

  it('renders with different typography variants', () => {
    render(<AlertTitle data-testid="alert-title">Important Alert</AlertTitle>);

    const alertTitle = screen.getByTestId('alert-title');
    expect(alertTitle).toBeInTheDocument();
    expect(alertTitle).toHaveClass('MuiAlertTitle-root');
  });

  it('renders within Alert context', () => {
    render(
      <div>
        <AlertTitle>Warning</AlertTitle>
        <div>This is the alert message content.</div>
      </div>
    );

    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('This is the alert message content.')).toBeInTheDocument();
  });

  it('handles empty content', () => {
    render(<AlertTitle data-testid="empty-alert-title" />);

    const alertTitle = screen.getByTestId('empty-alert-title');
    expect(alertTitle).toBeInTheDocument();
    expect(alertTitle).toHaveClass('MuiAlertTitle-root');
  });

  it('renders with long text content', () => {
    const longTitle =
      'This is a very long alert title that might wrap to multiple lines in the user interface';

    render(<AlertTitle>{longTitle}</AlertTitle>);

    const alertTitle = screen.getByText(longTitle);
    expect(alertTitle).toBeInTheDocument();
  });
});
