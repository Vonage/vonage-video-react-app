import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Chip from './index';

describe('Chip', () => {
  it('renders correctly', () => {
    render(<Chip label="Test chip" />);

    expect(screen.getByText('Test chip')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Chip label="Filled chip" variant="filled" data-testid="chip" />);

    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('MuiChip-filled');

    rerender(<Chip label="Outlined chip" variant="outlined" data-testid="chip" />);
    expect(chip).toHaveClass('MuiChip-outlined');
  });

  it('renders with different colors', () => {
    const { rerender } = render(<Chip label="Primary chip" color="primary" data-testid="chip" />);

    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('MuiChip-colorPrimary');

    rerender(<Chip label="Secondary chip" color="secondary" data-testid="chip" />);
    expect(chip).toHaveClass('MuiChip-colorSecondary');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Chip label="Small chip" size="small" data-testid="chip" />);

    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('MuiChip-sizeSmall');

    rerender(<Chip label="Medium chip" size="medium" data-testid="chip" />);
    expect(chip).toHaveClass('MuiChip-sizeMedium');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();

    render(<Chip label="Clickable chip" onClick={handleClick} />);

    const chip = screen.getByRole('button', { name: 'Clickable chip' });
    fireEvent.click(chip);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    const TestIcon = () => <span>🏷️</span>;

    render(<Chip label="Chip with icon" icon={<TestIcon />} />);

    expect(screen.getByText('🏷️')).toBeInTheDocument();
    expect(screen.getByText('Chip with icon')).toBeInTheDocument();
  });

  it('renders with avatar', () => {
    const TestAvatar = () => <span data-testid="chip-avatar">AV</span>;

    render(<Chip label="Chip with avatar" avatar={<TestAvatar />} />);

    expect(screen.getByTestId('chip-avatar')).toBeInTheDocument();
    expect(screen.getByText('Chip with avatar')).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    render(<Chip label="Disabled chip" disabled />);

    const chip = screen.getByText('Disabled chip').closest('.MuiChip-root');
    expect(chip).toHaveClass('Mui-disabled');
  });
});
