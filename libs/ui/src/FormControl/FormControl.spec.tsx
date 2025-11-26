import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TextField from '@ui/TextField';
import FormControl from './index';

describe('FormControl', () => {
  it('renders correctly', () => {
    render(
      <FormControl>
        Test Label
        <TextField />
      </FormControl>
    );

    const formControl = screen.getByText('Test Label').closest('.MuiFormControl-root');
    expect(formControl).toBeInTheDocument();
  });

  it('renders with children components', () => {
    render(
      <FormControl>
        Name
        <TextField placeholder="Enter your name" />
      </FormControl>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });
});
