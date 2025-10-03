import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LanguageSelector from './index';

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

const originalEnv = import.meta.env;

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockI18n.language = 'en';
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es|it';

      render(<LanguageSelector />);

      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });

    it('renders without flags when showFlag is false', () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es';

      render(<LanguageSelector showFlag={false} />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.queryByText('🇺🇸')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en';

      render(<LanguageSelector className="bg-red-500" />);

      const formControl = screen.getByTestId('language-selector').closest('.MuiFormControl-root');
      expect(formControl).toHaveClass('bg-red-500');
    });
  });

  describe('Supported Languages', () => {
    it('shows only supported languages from environment variable', async () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es';

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
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es|es-MX|it';

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-es')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-es-MX')).toBeInTheDocument();
        expect(screen.getByTestId('language-option-it')).toBeInTheDocument();
      });
    });

    it('falls back to en when no supported languages env var', async () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = '';

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
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es|it';

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
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es-MX';

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('language-option-es-MX')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('language-option-es-MX'));

      expect(mockChangeLanguage).toHaveBeenCalledWith('es-MX');
    });
  });

  describe('Current Language Display', () => {
    it('displays current language correctly', () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es|it';
      mockI18n.language = 'es';

      // Mock Spanish translations
      mockT.mockImplementation((key: string) => {
        const spanishTranslations: Record<string, string> = {
          'languages.english': 'Inglés',
          'languages.spanish': 'Español',
          'languages.italian': 'Italiano',
        };
        return spanishTranslations[key] || key;
      });

      render(<LanguageSelector />);

      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('🇪🇸')).toBeInTheDocument();
    });

    it('handles unsupported language gracefully', () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es';
      mockI18n.language = 'fr';

      render(<LanguageSelector />);

      expect(screen.getByDisplayValue('fr')).toBeInTheDocument();
    });
  });

  describe('Fallback Language Handling', () => {
    it('uses en as fallback when current language is empty', () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es';
      mockI18n.language = '';

      render(<LanguageSelector />);

      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('uses en as fallback when current language is undefined', () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es';
      mockI18n.language = undefined;

      render(<LanguageSelector />);

      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('uses en as fallback when current language is null', () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es';
      mockI18n.language = null;

      render(<LanguageSelector />);

      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  describe('Dropdown Behavior', () => {
    it('shows language options when opened', async () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es|it';

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

    it('displays language names and flags in options', async () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es';

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        const englishOption = screen.getByTestId('language-option-en');
        expect(englishOption).toHaveTextContent('English');
        expect(englishOption).toHaveTextContent('🇺🇸');

        const spanishOption = screen.getByTestId('language-option-es');
        expect(spanishOption).toHaveTextContent('Español');
        expect(spanishOption).toHaveTextContent('🇪🇸');
      });
    });

    it('hides flags in options when showFlag is false', async () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es';

      render(<LanguageSelector showFlag={false} />);

      const selectButton = screen.getByRole('combobox');
      fireEvent.mouseDown(selectButton);

      await waitFor(() => {
        const englishOption = screen.getByTestId('language-option-en');
        expect(englishOption).toHaveTextContent('English');
        expect(englishOption).not.toHaveTextContent('🇺🇸');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper test ids for testing', async () => {
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en|es';

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
      import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES = 'en';

      render(<LanguageSelector />);

      const selectButton = screen.getByRole('combobox');
      expect(selectButton).toBeInTheDocument();
      expect(selectButton).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });
});
