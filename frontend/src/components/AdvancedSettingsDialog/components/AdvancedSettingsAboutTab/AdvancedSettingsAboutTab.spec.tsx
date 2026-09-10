import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AdvancedSettingsAboutTab from './AdvancedSettingsAboutTab';

describe('AdvancedSettingsAboutTab', () => {
  it('shows the reference link, app version, and static contributors', () => {
    render(<AdvancedSettingsAboutTab />);

    expect(screen.getByTestId('advanced-settings-about-vonage-link')).toHaveAttribute(
      'href',
      'https://developer.vonage.com/en/video/react-reference-app/overview'
    );
    expect(screen.getByTestId('app-version')).toBeVisible();
    expect(
      screen.getByTestId('advanced-settings-about-contributor-Hossein-Movahed')
    ).toHaveAttribute('href', 'https://github.com/Hossein-Movahed');
    expect(
      screen.getByTestId('advanced-settings-about-contributor-johnny-quesada-developer')
    ).toHaveAttribute('href', 'https://github.com/johnny-quesada-developer');
    expect(screen.getByTestId('advanced-settings-about-contributor-OscarFava')).toHaveAttribute(
      'href',
      'https://github.com/OscarFava'
    );
  });
});
