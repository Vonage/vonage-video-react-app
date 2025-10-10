import { ReactElement } from 'react';
import { Select, MenuItem, FormControl, SelectChangeEvent, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  showFlag?: boolean;
  className?: string;
}

/**
 * LanguageSelector Component
 * A dropdown component that allows users to select their preferred language.
 * The available languages are determined by the VITE_I18N_SUPPORTED_LANGUAGES environment variable.
 * @param {LanguageSelectorProps} props - The props for the component.
 * @property {boolean} showFlag - Whether to display the country flag alongside the language name.
 * @property {string} className - Additional CSS classes to apply to the component.
 * @returns {ReactElement} The rendered LanguageSelector component.
 */
const LanguageSelector = ({ showFlag = true, className }: LanguageSelectorProps): ReactElement => {
  const { i18n } = useTranslation();
  const isSmallViewport = useIsSmallViewport();

  const envLangs = import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES;
  const supportedLanguages = envLangs && envLangs.trim() !== '' ? envLangs.split('|') : ['en'];

  const languageOptions: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
  ].filter((option) => supportedLanguages.includes(option.code));

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
  };

  const currentLanguage = i18n.language || 'en';

  return (
    <FormControl variant="outlined" size="small" className={className}>
      <Select
        value={currentLanguage}
        onChange={handleLanguageChange}
        displayEmpty
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }}
        renderValue={(value) => {
          const selectedOption = languageOptions.find((option) => option.code === value);
          if (!selectedOption) {
            return value;
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showFlag && <Typography fontSize={36}>{selectedOption.flag}</Typography>}
              {!isSmallViewport && <span>{selectedOption.name}</span>}
            </Box>
          );
        }}
        data-testid="language-selector"
      >
        {languageOptions.map((option) => (
          <MenuItem
            key={option.code}
            value={option.code}
            data-testid={`language-option-${option.code}`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showFlag && <Typography fontSize={20}>{option.flag}</Typography>}
              <span>{option.name}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
