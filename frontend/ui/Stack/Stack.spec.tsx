import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Stack from './Stack';

describe('Stack', () => {
  it('renders correctly', () => {
    render(<Stack>Stack content</Stack>);

    const stack = screen.getByRole('Stack', { name: 'Stack content' });
    expect(stack).toBeInTheDocument();
  });
});
