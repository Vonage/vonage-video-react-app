import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectableOption from './SelectableOption';

describe('SelectableOption', () => {
  it('renders with icon when image is not provided', () => {
    render(
      <SelectableOption
        isSelected={false}
        onClick={() => {}}
        id="icon-option"
        icon={<span data-testid="test-icon">Icon</span>}
      />
    );
    expect(screen.getByTestId('background-icon-option')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders with image when image is provided', () => {
    render(
      <SelectableOption isSelected={false} onClick={() => {}} id="img-option" image="/test.jpg" />
    );
    expect(screen.getByTestId('background-img-option')).toBeInTheDocument();
    expect(screen.getByAltText('background')).toHaveAttribute('src', '/test.jpg');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(
      <SelectableOption
        isSelected={false}
        onClick={handleClick}
        id="clickable"
        icon={<span>Click</span>}
      />
    );
    await userEvent.click(screen.getByTestId('background-clickable'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('shows selected aria-pressed when selected', () => {
    render(
      <SelectableOption isSelected onClick={() => {}} id="selected" icon={<span>Selected</span>} />
    );
    const option = screen.getByTestId('background-selected');
    expect(option).toHaveAttribute('aria-pressed', 'true');
  });

  it('is disabled when isDisabled is true', () => {
    render(
      <SelectableOption
        isSelected={false}
        onClick={() => {}}
        id="disabled"
        icon={<span>Disabled</span>}
        isDisabled
      />
    );
    const option = screen.getByTestId('background-disabled');
    expect(option).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows the title in the tooltip', async () => {
    render(
      <SelectableOption
        isSelected={false}
        onClick={() => {}}
        id="with-title"
        icon={<span>Icon</span>}
        title="My Tooltip Title"
      />
    );
    await userEvent.hover(screen.getByTestId('background-with-title'));
    expect(screen.getByLabelText('My Tooltip Title')).toBeInTheDocument();
  });

  it('renders children inside the option', () => {
    render(
      <SelectableOption
        isSelected={false}
        onClick={() => {}}
        id="with-children"
        icon={<span>Icon</span>}
      >
        <span data-testid="child-content">Child Content</span>
      </SelectableOption>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});
