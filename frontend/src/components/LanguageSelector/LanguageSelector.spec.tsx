/* eslint-disable import/first */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../env', async () => {
  const actual = await vi.importActual<typeof import('../../env')>('../../env');
  const { Env } = actual;

  return {
    ...actual,
    default: new Env({}),
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageSelector from './LanguageSelector';
import env from '../../env';

// Mock VividIcon component
vi.mock('../VividIcon/VividIcon', () => ({
  default: ({ name, customSize }: { name: string; customSize: number }) => (
    <div data-testid={`vivid-icon-${name}`} data-size={customSize}>
      {name}
    </div>
  ),
}));

// Mock react-i18next
const mockChangeLanguage = vi.fn();
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'languages.english': 'English',
    'languages.spanish': 'Español',
    'languages.spanishMX': 'Español (México)',
    'languages.italian': 'Italiano',
  };
  return translations[key] || key;
});

const mockI18n: {
  language: string | undefined | null;
  changeLanguage: typeof mockChangeLanguage;
  options: {
    fallbackLng: string;
  };
} = {
  language: 'en',
  changeLanguage: mockChangeLanguage,
  options: {
    fallbackLng: 'en',
  },
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: mockI18n,
  }),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockI18n.language = 'en';
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      env.setSupportedLanguages('en|es|it');

      render(<LanguageSelector />);

      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-flag-united-kingdom')).toBeInTheDocument();
    });

    it('renders without flags when showFlag is false', () => {
      env.setSupportedLanguages('en|es');

      render(<LanguageSelector showFlag={false} />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.queryByTestId('vivid-icon-flag-united-kingdom')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      env.setSupportedLanguages('en');

      render(<LanguageSelector className="bg-red-500" />);

      const formControl = screen.getByTestId('language-selector').closest('.MuiFormControl-root');
      expect(formControl).toHaveClass('bg-red-500');
    });

    it('renders VividIcon with correct size in main display', () => {
      env.setSupportedLanguages('en');

      render(<LanguageSelector />);

      const icon = screen.getByTestId('vivid-icon-flag-united-kingdom');
      expect(icon).toHaveAttribute('data-size', '-3');
    });
  });

  describe('Supported Languages', () => {
    it('shows only supported languages from environment variable', async () => {
      env.setSupportedLanguages('en|es');

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-es')).toBeInTheDocument();
        expect(screen.queryByTestId('language-option-it')).not.toBeInTheDocument();
        expect(screen.queryByTestId('language-option-es-MX')).not.toBeInTheDocument();
      });
    });

    it('shows all languages when all are supported', async () => {
      env.setSupportedLanguages('en|es|es-MX|it|en-US');

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-es')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-es-MX')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-it')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-en-US')).toBeInTheDocument();
      });
    });

    it('falls back to en when no supported languages env var', async () => {
      env.setSupportedLanguages('');

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
        expect(screen.queryByTestId('language-option-es')).not.toBeInTheDocument();
      });
    });
  });

  describe('Language Selection', () => {
    it('changes language when option is selected', async () => {
      env.setSupportedLanguages('en|es|it');

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-es')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('language-option-es'));

      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });

    it('changes language to es-MX when selected', async () => {
      env.setSupportedLanguages('en|es-MX');

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-es-MX')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('language-option-es-MX'));

      expect(mockChangeLanguage).toHaveBeenCalledWith('es-MX');
    });

    it('changes language to en-US when selected', async () => {
      env.setSupportedLanguages('en|en-US');

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-en-US')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('language-option-en-US'));

      expect(mockChangeLanguage).toHaveBeenCalledWith('en-US');
    });
  });

  describe('Current Language Display', () => {
    it('displays current language correctly with flag icon', () => {
      env.setSupportedLanguages('en|es|it');
      mockI18n.language = 'es';

      render(<LanguageSelector />);

      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-flag-spain')).toBeInTheDocument();
    });

    it('displays Italian language correctly', () => {
      env.setSupportedLanguages('en|es|it');
      mockI18n.language = 'it';

      render(<LanguageSelector />);

      expect(screen.getByText('Italiano')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-flag-italy')).toBeInTheDocument();
    });

    it('displays Mexican Spanish correctly', () => {
      env.setSupportedLanguages('en|es-MX');
      mockI18n.language = 'es-MX';

      render(<LanguageSelector />);

      expect(screen.getByText('Español (México)')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-flag-mexico')).toBeInTheDocument();
    });

    it('displays US English correctly', () => {
      env.setSupportedLanguages('en|en-US');
      mockI18n.language = 'en-US';

      render(<LanguageSelector />);

      expect(screen.getByText('English (US)')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-flag-united-states')).toBeInTheDocument();
    });

    it('handles unsupported language gracefully', () => {
      env.setSupportedLanguages('en|es');
      mockI18n.language = 'fr';

      render(<LanguageSelector />);

      expect(screen.getByDisplayValue('fr')).toBeInTheDocument();
    });
  });

  describe('Fallback Language Handling', () => {
    it('uses en as fallback when current language is empty', () => {
      env.setSupportedLanguages('en|es');
      mockI18n.language = '';

      render(<LanguageSelector />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-flag-united-kingdom')).toBeInTheDocument();
    });

    it('uses en as fallback when current language is undefined', () => {
      env.setSupportedLanguages('en|es');
      mockI18n.language = undefined;

      render(<LanguageSelector />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-flag-united-kingdom')).toBeInTheDocument();
    });

    it('uses en as fallback when current language is null', () => {
      env.setSupportedLanguages('en|es');
      mockI18n.language = null;

      render(<LanguageSelector />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-flag-united-kingdom')).toBeInTheDocument();
    });
  });

  describe('Dropdown Behavior', () => {
    it('shows language options when opened', async () => {
      env.setSupportedLanguages('en|es|it');

      render(<LanguageSelector />);

      expect(screen.queryByTestId('language-option-es')).not.toBeInTheDocument();

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-es')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-it')).toBeInTheDocument();
      });
    });

    it('displays language names and flag icons in options', async () => {
      env.setSupportedLanguages('en|es');

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        const englishOption = screen.getByTestId('language-option-en');
        expect(englishOption).toHaveTextContent('English');

        const spanishOption = screen.getByTestId('language-option-es');
        expect(spanishOption).toHaveTextContent('Español');

        // Check for flag icons in dropdown (they should have size -5)
        const englishIcon = screen
          .getAllByTestId('vivid-icon-flag-united-kingdom')
          .find((icon) => icon.getAttribute('data-size') === '-5');
        const spanishIcon = screen
          .getAllByTestId('vivid-icon-flag-spain')
          .find((icon) => icon.getAttribute('data-size') === '-5');

        expect(englishIcon).toBeInTheDocument();
        expect(spanishIcon).toBeInTheDocument();
      });
    });

    it('hides flags in options when showFlag is false', async () => {
      env.setSupportedLanguages('en|es');

      render(<LanguageSelector showFlag={false} />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        const englishOption = screen.getByTestId('language-option-en');
        expect(englishOption).toHaveTextContent('English');
        expect(screen.queryByTestId('vivid-icon-flag-united-kingdom')).not.toBeInTheDocument();
        expect(screen.queryByTestId('vivid-icon-flag-spain')).not.toBeInTheDocument();
      });
    });

    it('renders VividIcon with correct size in dropdown options', async () => {
      env.setSupportedLanguages('en|es');

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        // Check that dropdown icons have size -5
        const dropdownIcon = screen
          .getAllByTestId('vivid-icon-flag-united-kingdom')
          .find((icon) => icon.getAttribute('data-size') === '-5');
        expect(dropdownIcon).toBeInTheDocument();
      });
    });
  });

  describe('VividIcon Integration', () => {
    it('uses different sizes for display vs dropdown', async () => {
      env.setSupportedLanguages('en');

      render(<LanguageSelector />);

      // Main display should have size -3
      const displayIcon = screen.getByTestId('vivid-icon-flag-united-kingdom');
      expect(displayIcon).toHaveAttribute('data-size', '-3');

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        // Dropdown should have size -5 (smaller)
        const dropdownIcons = screen.getAllByTestId('vivid-icon-flag-united-kingdom');
        const dropdownIcon = dropdownIcons.find((icon) => icon.getAttribute('data-size') === '-5');
        expect(dropdownIcon).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper test ids for testing', async () => {
      env.setSupportedLanguages('en|es');

      render(<LanguageSelector />);

      expect(screen.getByTestId('language-selector')).toBeInTheDocument();

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-es')).toBeInTheDocument();
      });
    });

    it('maintains MUI Select accessibility features', () => {
      env.setSupportedLanguages('en');

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      expect(selectButton).toBeInTheDocument();
      expect(selectButton).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('VividIcon components have proper test ids', () => {
      env.setSupportedLanguages('en');

      render(<LanguageSelector />);

      expect(screen.getByTestId('vivid-icon-flag-united-kingdom')).toBeInTheDocument();
    });
  });
});
