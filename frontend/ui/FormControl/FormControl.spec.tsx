import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormLabel, TextField, FormHelperText } from '@mui/material';
import FormControl from './index';

describe('FormControl', () => {
  it('renders correctly', () => {
    render(
      <FormControl>
        <FormLabel>Test Label</FormLabel>
        <TextField />
      </FormControl>
    );

    const formControl = screen.getByText('Test Label').closest('.MuiFormControl-root');
    expect(formControl).toBeInTheDocument();
  });

  it('renders with children components', () => {
    render(
      <FormControl>
        <FormLabel>Name</FormLabel>
        <TextField placeholder="Enter your name" />
        <FormHelperText>This field is required</FormHelperText>
      </FormControl>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
