import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import FieldInput from './FieldInput';

describe('FieldInput', () => {
  describe('switch variant', () => {
    it('calls onChange with true when toggled from unchecked', () => {
      const onChange = vi.fn();

      const { getByRole } = render(
        <FieldInput variant="switch" id="test-switch" checked={false} onChange={onChange} />
      );

      fireEvent.click(getByRole('checkbox'));

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange with false when toggled from checked', () => {
      const onChange = vi.fn();

      const { getByRole } = render(
        <FieldInput variant="switch" id="test-switch" checked={true} onChange={onChange} />
      );

      fireEvent.click(getByRole('checkbox'));

      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('renders as disabled when disabled prop is set', () => {
      const { getByRole } = render(
        <FieldInput variant="switch" id="test-switch" checked={false} onChange={vi.fn()} disabled />
      );

      expect((getByRole('checkbox') as HTMLInputElement).disabled).toBe(true);
    });

    it('renders the small switch size classes when requested', () => {
      const { container } = render(
        <FieldInput
          variant="switch"
          id="test-switch"
          checked={false}
          onChange={vi.fn()}
          size="small"
        />
      );

      expect(container.querySelector('span')).toHaveClass('h-5', 'w-9', 'after:h-4', 'after:w-4');
    });

    it('toggles when the visible switch track is clicked', () => {
      const onChange = vi.fn();
      const { container } = render(
        <FieldInput variant="switch" id="test-switch" checked={false} onChange={onChange} />
      );

      fireEvent.click(container.querySelector('span')!);

      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('native input variant', () => {
    it('renders a native input with passed props', () => {
      const { getByRole } = render(<FieldInput type="text" placeholder="Enter value" />);

      const input = getByRole('textbox') as HTMLInputElement;

      expect(input.placeholder).toBe('Enter value');
    });
  });
});
