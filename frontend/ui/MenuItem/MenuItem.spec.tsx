import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuItem from './MenuItem';

describe('MenuItem', () => {
  it('renders correctly', () => {
    render(<MenuItem>Test Menu Item</MenuItem>);

    const menuItem = screen.getByRole('menuitem');
    expect(menuItem).toBeInTheDocument();
    expect(menuItem).toHaveTextContent('Test Menu Item');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();

    render(<MenuItem onClick={handleClick}>Clickable Menu Item</MenuItem>);

    const menuItem = screen.getByRole('menuitem');
    fireEvent.click(menuItem);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with value prop', () => {
    render(<MenuItem value="option1">Option 1</MenuItem>);

    const menuItem = screen.getByRole('menuitem');
    expect(menuItem).toBeInTheDocument();
    expect(menuItem).toHaveTextContent('Option 1');
  });
});
