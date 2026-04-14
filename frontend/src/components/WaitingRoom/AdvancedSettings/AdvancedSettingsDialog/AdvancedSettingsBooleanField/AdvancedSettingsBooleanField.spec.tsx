import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsBooleanField from './AdvancedSettingsBooleanField';

describe('AdvancedSettingsBooleanField', () => {
  it('renders label and description', () => {
    render(
      <AdvancedSettingsBooleanField
        label="Enable stats"
        checked={false}
        onChange={() => {}}
        description="Collect live metrics"
      />
    );

    expect(screen.getByRole('heading', { name: /enable stats/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /enable stats/i })).toBeInTheDocument();
    expect(screen.getByText(/collect live metrics/i)).toBeInTheDocument();
  });

  it('calls onChange when toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AdvancedSettingsBooleanField
        label="Enable stats"
        checked={false}
        onChange={onChange}
        description="Collect live metrics"
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /enable stats/i }));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
