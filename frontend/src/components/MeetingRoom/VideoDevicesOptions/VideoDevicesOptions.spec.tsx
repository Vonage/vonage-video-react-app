import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import VideoDevicesOptions from './VideoDevicesOptions';
import enTranslations from '../../../locales/en.json';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'backgroundEffects.title': enTranslations['backgroundEffects.title'],
      };
      return translations[key] || key;
    },
  }),
}));

describe('VideoDevicesOptions', () => {
  const toggleBackgroundEffects = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the background effects menu item', () => {
    render(<VideoDevicesOptions toggleBackgroundEffects={toggleBackgroundEffects} />);
    expect(screen.getByTestId('background-effects-text')).toHaveTextContent('Background Effects');
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('calls toggleBackgroundEffects when menu item is clicked', () => {
    render(<VideoDevicesOptions toggleBackgroundEffects={toggleBackgroundEffects} />);
    fireEvent.click(screen.getByRole('menuitem'));
    expect(toggleBackgroundEffects).toHaveBeenCalled();
  });
});
