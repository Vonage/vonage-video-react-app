import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Typography from './index';

describe('Typography', () => {
  it('renders correctly', () => {
    render(<Typography>Typography content</Typography>);

    const typography = screen.getByText('Typography content');
    expect(typography).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Typography variant="h1">Heading 1</Typography>);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Heading 1')).toBeInTheDocument();

    rerender(<Typography variant="h2">Heading 2</Typography>);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    rerender(<Typography variant="body1">Body text</Typography>);
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('renders with custom component', () => {
    render(
      <Typography component="span" data-testid="span-typography">
        Span content
      </Typography>
    );

    const typography = screen.getByTestId('span-typography');
    expect(typography.tagName).toBe('SPAN');
    expect(typography).toHaveTextContent('Span content');
  });

  it('handles empty content', () => {
    render(<Typography data-testid="empty-typography" />);

    const typography = screen.getByTestId('empty-typography');
    expect(typography).toBeInTheDocument();
  });
});
