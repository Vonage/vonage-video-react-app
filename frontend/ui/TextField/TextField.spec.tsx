import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TextField from './TextField';

describe('TextField', () => {
  it('renders correctly', () => {
    render(<TextField>TextField content</TextField>);

    const textField = screen.getByRole('TextField', { name: 'TextField content' });
    expect(textField).toBeInTheDocument();
  });
});
