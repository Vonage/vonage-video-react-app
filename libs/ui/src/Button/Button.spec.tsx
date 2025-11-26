import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './index';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });
});
