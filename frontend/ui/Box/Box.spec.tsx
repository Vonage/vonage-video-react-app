import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Box from './Box';

describe('Box', () => {
  it('renders correctly', () => {
    render(<Box>Box content</Box>);

    const box = screen.getByRole('Box', { name: 'Box content' });
    expect(box).toBeInTheDocument();
  });
});
