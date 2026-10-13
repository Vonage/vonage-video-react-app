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

      expect(onChange).toHaveBeenCalled();
    });

    it('calls onChange with false when toggled from checked', () => {
      const onChange = vi.fn();

      const { getByRole } = render(
        <FieldInput variant="switch" id="test-switch" checked={true} onChange={onChange} />
      );

      fireEvent.click(getByRole('checkbox'));

      expect(onChange).toHaveBeenCalled();
    });

    it('renders as disabled when disabled prop is set', () => {
      const { getByRole } = render(
        <FieldInput variant="switch" id="test-switch" checked={false} onChange={vi.fn()} disabled />
      );

      expect((getByRole('checkbox') as HTMLInputElement).disabled).toBe(true);
    });

    it('renders the small switch size classes when requested', () => {
      const { getByRole } = render(
        <FieldInput
          variant="switch"
          id="test-switch"
          checked={false}
          onChange={vi.fn()}
          size="small"
        />
      );

      expect(getByRole('checkbox')).toHaveClass('h-5', 'w-9');
    });

    it('toggles when clicked directly', () => {
      const onChange = vi.fn();
      const { getByRole } = render(
        <FieldInput variant="switch" id="test-switch" checked={false} onChange={onChange} />
      );

      fireEvent.click(getByRole('checkbox'));

      expect(onChange).toHaveBeenCalled();
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
