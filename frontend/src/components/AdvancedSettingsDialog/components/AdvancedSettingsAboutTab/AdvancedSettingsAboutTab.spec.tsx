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
    expect(screen.getByTestId('footer-links')).toHaveClass('justify-center');
    expect(screen.getByTestId('advanced-settings-about-vonage-link')).toHaveTextContent(
      'Learn more'
    );
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
    expect(
      screen.getByTestId('advanced-settings-about-contributor-masayukimiyazawa')
    ).toHaveAttribute('href', 'https://github.com/masayukimiyazawa');
    expect(screen.getByTestId('advanced-settings-about-contributor-czoli1976')).toHaveAttribute(
      'href',
      'https://github.com/czoli1976'
    );
    expect(
      screen.getByTestId('advanced-settings-about-contributor-mend-for-github-com[bot]')
    ).toHaveAttribute('href', 'https://github.com/mend-for-github-com[bot]');
    expect(screen.getAllByTestId(/^advanced-settings-about-contributor-/)).toHaveLength(20);
  });
});
