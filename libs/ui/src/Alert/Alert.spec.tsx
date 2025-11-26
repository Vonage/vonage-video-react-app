import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Alert from './index';

describe('Alert', () => {
  it('renders correctly', () => {
    render(<Alert>This is an alert message</Alert>);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('This is an alert message')).toBeInTheDocument();
  });

  it('renders with different severities', () => {
    const { rerender } = render(<Alert severity="error">Error message</Alert>);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardError');

    rerender(<Alert severity="warning">Warning message</Alert>);
    expect(alert).toHaveClass('MuiAlert-standardWarning');

    rerender(<Alert severity="info">Info message</Alert>);
    expect(alert).toHaveClass('MuiAlert-standardInfo');

    rerender(<Alert severity="success">Success message</Alert>);
    expect(alert).toHaveClass('MuiAlert-standardSuccess');
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Alert variant="standard" severity="info">
        Standard alert
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardInfo');

    rerender(
      <Alert variant="filled" severity="info">
        Filled alert
      </Alert>
    );
    expect(alert).toHaveClass('MuiAlert-filledInfo');

    rerender(
      <Alert variant="outlined" severity="info">
        Outlined alert
      </Alert>
    );
    expect(alert).toHaveClass('MuiAlert-outlinedInfo');
  });

  it('renders with icon', () => {
    render(
      <Alert severity="success" icon={<span>✓</span>}>
        Success with custom icon
      </Alert>
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('Success with custom icon')).toBeInTheDocument();
  });

  it('renders without icon', () => {
    render(
      <Alert severity="info" icon={false}>
        Info without icon
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Info without icon')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    render(
      <Alert severity="error" action={<button type="button">Undo</button>}>
        Error with action
      </Alert>
    );

    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.getByText('Error with action')).toBeInTheDocument();
  });
});
