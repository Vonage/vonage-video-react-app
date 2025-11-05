import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InputAdornment from './InputAdornment';

describe('InputAdornment', () => {
  it('renders correctly', () => {
    render(<InputAdornment position="start">InputAdornment content</InputAdornment>);

    const inputAdornment = screen.getByRole('InputAdornment', { name: 'InputAdornment content' });
    expect(inputAdornment).toBeInTheDocument();
  });
});
