import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InputAdornment from './index';

describe('InputAdornment', () => {
  it('renders correctly', () => {
    render(<InputAdornment position="start">$ </InputAdornment>);

    const inputAdornment = screen.getByText('$');
    expect(inputAdornment).toBeInTheDocument();
  });

  it('renders with start position', () => {
    render(
      <InputAdornment position="start" data-testid="start-adornment">
        @
      </InputAdornment>
    );

    const adornment = screen.getByTestId('start-adornment');
    expect(adornment).toBeInTheDocument();
    expect(screen.getByText('@')).toBeInTheDocument();
  });

  it('renders with end position', () => {
    render(
      <InputAdornment position="end" data-testid="end-adornment">
        .com
      </InputAdornment>
    );

    const adornment = screen.getByTestId('end-adornment');
    expect(adornment).toBeInTheDocument();
    expect(screen.getByText('.com')).toBeInTheDocument();
  });
});
