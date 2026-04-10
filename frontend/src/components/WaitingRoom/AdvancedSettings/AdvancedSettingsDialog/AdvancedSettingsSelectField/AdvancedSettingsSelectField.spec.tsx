import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsSelectField from './AdvancedSettingsSelectField';

describe('AdvancedSettingsSelectField', () => {
  it('renders label and description', () => {
    render(
      <AdvancedSettingsSelectField
        label="Codec"
        value="automatic"
        onChange={() => {}}
        description="Choose the codec mode"
        options={[
          { value: 'automatic', label: 'Automatic' },
          { value: 'manual', label: 'Manual' },
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: /codec/i })).toBeInTheDocument();
    expect(screen.getByText(/choose the codec mode/i)).toBeInTheDocument();
  });

  it('calls onChange when selecting another option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AdvancedSettingsSelectField
        label="Codec"
        value="automatic"
        onChange={onChange}
        options={[
          { value: 'automatic', label: 'Automatic' },
          { value: 'manual', label: 'Manual' },
        ]}
      />
    );

    await user.selectOptions(screen.getByRole('combobox'), 'manual');

    expect(onChange).toHaveBeenCalledWith('manual');
  });
});
