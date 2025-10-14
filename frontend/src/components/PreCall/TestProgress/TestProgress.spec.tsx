import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TestProgress from './TestProgress';
import enTranslations from '../../../locales/en.json';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'precallTest.testingInProgress': enTranslations['precallTest.testingInProgress'],
      };
      return translations[key] || key;
    },
  }),
}));

describe('TestProgress', () => {
  it('renders correctly and displays the correct translation text', () => {
    render(<TestProgress />);

    const progressText = screen.getByText(enTranslations['precallTest.testingInProgress']);
    expect(progressText).toBeInTheDocument();
  });
});
