import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Card from './';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Test content</Card>);

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom sx props', () => {
    const { container } = render(<Card sx={{ backgroundColor: 'red' }}>Content</Card>);

    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
  });

  it('renders as form when component prop is passed', () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

    const { container } = render(
      <Card component="form" onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Card>
    );

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form?.tagName).toBe('FORM');
  });

  it('forwards additional props to the underlying Box component', () => {
    render(
      <Card data-testid="custom-card" aria-label="Test card">
        Content
      </Card>
    );

    const card = screen.getByTestId('custom-card');
    expect(card).toHaveAttribute('aria-label', 'Test card');
  });

  it('merges sx props correctly', () => {
    const { container } = render(<Card sx={{ margin: 2 }}>Content</Card>);

    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
  });
});
