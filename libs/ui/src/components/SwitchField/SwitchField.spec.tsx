import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SwitchField from '.';

describe('SwitchField', () => {
  it('renders the label and description bound to the input', () => {
    render(
      <SwitchField
        id="reduce-noise"
        label="Reduce noise"
        description="Suppresses background noise."
        checked={false}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Reduce noise')).toBeInTheDocument();
    expect(screen.getByText('Suppresses background noise.')).toBeInTheDocument();
  });

  it('reports changes and reflects the checked state', () => {
    const onChange = vi.fn();

    render(<SwitchField id="reduce-noise" label="Reduce noise" checked onChange={onChange} />);

    const input = screen.getByLabelText('Reduce noise');
    expect(input).toBeChecked();

    input.click();
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards disabled to the input so callers can gate it on browser support', () => {
    render(
      <SwitchField
        id="reduce-noise"
        label="Reduce noise"
        checked={false}
        onChange={vi.fn()}
        disabled
      />
    );

    expect(screen.getByLabelText('Reduce noise')).toBeDisabled();
  });
});
