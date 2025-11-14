import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IconButton from './index';

describe('IconButton', () => {
  it('renders correctly', () => {
    const TestIcon = () => <span>🔍</span>;

    render(
      <IconButton aria-label="Search">
        <TestIcon />
      </IconButton>
    );

    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    const TestIcon = () => <span>⭐</span>;

    render(
      <IconButton onClick={handleClick} aria-label="Favorite">
        <TestIcon />
      </IconButton>
    );

    const button = screen.getByRole('button', { name: 'Favorite' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different sizes', () => {
    const TestIcon = () => <span>📝</span>;
    const { rerender } = render(
      <IconButton size="small" aria-label="Edit">
        <TestIcon />
      </IconButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiIconButton-sizeSmall');

    rerender(
      <IconButton size="medium" aria-label="Edit">
        <TestIcon />
      </IconButton>
    );
    expect(button).toHaveClass('MuiIconButton-sizeMedium');

    rerender(
      <IconButton size="large" aria-label="Edit">
        <TestIcon />
      </IconButton>
    );
    expect(button).toHaveClass('MuiIconButton-sizeLarge');
  });
});
