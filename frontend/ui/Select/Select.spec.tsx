import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MenuItem } from '@mui/material';
import Select from './Select';

describe('Select', () => {
  it('renders correctly', () => {
    render(
      <Select value="" displayEmpty>
        <MenuItem value="">Select an option</MenuItem>
        <MenuItem value="option1">Option 1</MenuItem>
        <MenuItem value="option2">Option 2</MenuItem>
      </Select>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();

    render(
      <Select value="" onChange={handleChange} displayEmpty>
        <MenuItem value="">Choose...</MenuItem>
        <MenuItem value="option1">Option 1</MenuItem>
        <MenuItem value="option2">Option 2</MenuItem>
      </Select>
    );

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    const option1 = screen.getByRole('option', { name: 'Option 1' });
    fireEvent.click(option1);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state', () => {
    render(
      <Select value="option1" disabled>
        <MenuItem value="option1">Option 1</MenuItem>
        <MenuItem value="option2">Option 2</MenuItem>
      </Select>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders with error state', () => {
    render(
      <Select value="" error displayEmpty>
        <MenuItem value="">Select...</MenuItem>
        <MenuItem value="valid">Valid Option</MenuItem>
      </Select>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    // Error styling would be applied via CSS classes
  });

  it('renders with multiple selection', () => {
    render(
      <Select value={[]} multiple displayEmpty>
        <MenuItem value="option1">Option 1</MenuItem>
        <MenuItem value="option2">Option 2</MenuItem>
        <MenuItem value="option3">Option 3</MenuItem>
      </Select>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('shows placeholder when displayEmpty is true', () => {
    render(
      <Select value="" displayEmpty>
        <MenuItem value="">
          <em>Choose an option</em>
        </MenuItem>
        <MenuItem value="option1">Option 1</MenuItem>
      </Select>
    );

    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });
});
