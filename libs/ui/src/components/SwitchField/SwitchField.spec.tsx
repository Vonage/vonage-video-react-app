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
});
