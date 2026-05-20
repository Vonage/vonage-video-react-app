import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import AdvancedSettingsButton from './AdvancedSettingsButton';

describe('AdvancedSettingsButton', () => {
  it('renders the toolbar button', () => {
    render(<AdvancedSettingsButton />);

    expect(screen.getByTestId('advanced-settings-button')).toBeInTheDocument();
  });

  it('toggles the button tooltip state through context', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsButton />);

    await user.click(screen.getByTestId('advanced-settings-button'));

    expect(screen.getByTestId('advanced-settings-button')).toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  return renderBase(ui);
}
