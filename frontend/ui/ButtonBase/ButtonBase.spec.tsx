import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ButtonBase from './ButtonBase';

describe('ButtonBase', () => {
  it('renders children correctly', () => {
    render(<ButtonBase>Click me</ButtonBase>);

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles onClick event', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<ButtonBase onClick={handleClick}>Click me</ButtonBase>);

    const button = screen.getByText('Click me');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards additional props to the underlying MUI ButtonBase component', () => {
    render(
      <ButtonBase data-testid="custom-button" aria-label="Test button">
        Content
      </ButtonBase>
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });

  it('supports different button types', () => {
    render(<ButtonBase type="submit">Submit</ButtonBase>);

    const button = screen.getByText('Submit');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
