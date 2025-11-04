import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Typography from './Typography';

describe('Typography', () => {
  it('renders correctly', () => {
    render(<Typography>Typography content</Typography>);

    const typography = screen.getByRole('Typography', { name: 'Typography content' });
    expect(typography).toBeInTheDocument();
  });
});
