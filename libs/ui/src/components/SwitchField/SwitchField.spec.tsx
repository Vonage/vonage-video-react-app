import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SwitchField from '.';

describe('SwitchField', () => {
  it('renders the label bound to the switch and reflects the checked state', () => {
    render(
      <SwitchField id="echo-cancellation" label="Echo cancellation" checked onChange={vi.fn()} />
    );

    const input = screen.getByRole('checkbox');
    expect(input).toBeChecked();
    expect(input).toHaveAttribute('id', 'echo-cancellation');
    expect(screen.getByText('Echo cancellation')).toHaveAttribute('for', 'echo-cancellation');
  });

  it('reports the toggled value to onChange', () => {
    const onChange = vi.fn();
    render(
      <SwitchField id="noise-suppression" label="Noise suppression" checked onChange={onChange} />
    );

    screen.getByRole('checkbox').click();

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('renders the description only when one is given', () => {
    const { rerender } = render(
      <SwitchField id="agc" label="Auto gain control" checked={false} onChange={vi.fn()} />
    );
    expect(screen.queryByText('Keeps the microphone level steady')).not.toBeInTheDocument();

    rerender(
      <SwitchField
        id="agc"
        label="Auto gain control"
        checked={false}
        onChange={vi.fn()}
        description="Keeps the microphone level steady"
      />
    );
    expect(screen.getByText('Keeps the microphone level steady')).toBeInTheDocument();
  });

  it('does not report changes while disabled', () => {
    const onChange = vi.fn();
    render(
      <SwitchField
        id="advanced-noise-suppression"
        label="Advanced noise suppression"
        checked={false}
        onChange={onChange}
        disabled
      />
    );

    const input = screen.getByRole('checkbox');
    expect(input).toBeDisabled();

    input.click();
    expect(onChange).not.toHaveBeenCalled();
  });
});
