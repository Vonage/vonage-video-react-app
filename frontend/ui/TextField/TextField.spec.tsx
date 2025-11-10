import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TextField from './index';

describe('TextField', () => {
  it('renders correctly', () => {
    render(<TextField label="Test Label" />);

    const textField = screen.getByRole('textbox', { name: 'Test Label' });
    expect(textField).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<TextField placeholder="Enter text here" />);

    const textField = screen.getByPlaceholderText('Enter text here');
    expect(textField).toBeInTheDocument();
  });

  it('applies variant prop', () => {
    render(<TextField variant="outlined" label="Outlined Field" />);

    const textField = screen.getByRole('textbox', { name: 'Outlined Field' });
    expect(textField).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<TextField disabled label="Disabled Field" />);

    const textField = screen.getByRole('textbox', { name: 'Disabled Field' });
    expect(textField).toBeDisabled();
  });

  it('shows error state', () => {
    render(<TextField error helperText="This field has an error" label="Error Field" />);

    const textField = screen.getByRole('textbox', { name: 'Error Field' });
    expect(textField).toBeInTheDocument();
    expect(screen.getByText('This field has an error')).toBeInTheDocument();
  });

  it('handles different input types', () => {
    render(<TextField type="password" label="Password Field" />);

    const textField = screen.getByLabelText('Password Field');
    expect(textField).toHaveAttribute('type', 'password');
  });
});
