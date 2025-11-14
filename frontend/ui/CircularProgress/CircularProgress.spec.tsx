import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CircularProgress from './index';

describe('CircularProgress', () => {
  it('renders correctly', () => {
    render(<CircularProgress />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<CircularProgress size={60} data-testid="large-progress" />);

    const progress = screen.getByTestId('large-progress');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveClass('MuiCircularProgress-root');
  });

  it('applies custom sx props', () => {
    render(<CircularProgress sx={{ color: 'red' }} data-testid="styled-progress" />);

    const progress = screen.getByTestId('styled-progress');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveClass('MuiCircularProgress-root');
  });

  it('has proper accessibility attributes', () => {
    render(<CircularProgress variant="determinate" value={50} aria-label="Loading progress" />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(progress).toHaveAccessibleName('Loading progress');
  });
});
