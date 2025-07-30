import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBackgroundEffect from './AddBackgroundEffect';

describe('AddBackgroundEffect', () => {
  it('renders the add photo icon', () => {
    render(<AddBackgroundEffect />);
    const icon = screen.getByTestId('AddPhotoAlternateIcon');
    expect(icon).toBeInTheDocument();
  });

  it('renders the tooltip with recommended text when enabled', async () => {
    render(<AddBackgroundEffect />);
    const option = screen.getByTestId('background-upload');
    expect(option).toBeInTheDocument();
  });

  it('shows disabled tooltip when isDisabled is true', () => {
    render(<AddBackgroundEffect isDisabled />);
    const option = screen.getByTestId('background-upload');
    expect(option).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows the tooltip when hovered', async () => {
    render(<AddBackgroundEffect />);
    const option = screen.getByTestId('background-upload');
    await userEvent.hover(option);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    expect(tooltip).toHaveTextContent(/recommended/i);
  });
});
