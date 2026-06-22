import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AdvancedSettingsGeneralTab from './AdvancedSettingsGeneralTab';

describe('AdvancedSettingsGeneralTab', () => {
  it('renders the general tab content', () => {
    render(<AdvancedSettingsGeneralTab />);

    expect(screen.getByRole('heading', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset default values/i })).toBeInTheDocument();
    expect(screen.getByText(/restore all settings to their default values/i)).toBeInTheDocument();
  });
});
