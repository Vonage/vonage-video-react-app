import React from 'react';
import { Select, MenuItem, FormControl, SelectChangeEvent, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  showFlag?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ showFlag = true, className }) => {
  const { i18n } = useTranslation();

  const envLangs = import.meta.env.VITE_I18N_SUPPORTED_LANGUAGES;
  const supportedLanguages = envLangs && envLangs.trim() !== '' ? envLangs.split('|') : ['en'];

  const languageOptions: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
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
          minWidth: 120,
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        }}
        renderValue={(value) => {
          const selectedOption = languageOptions.find((option) => option.code === value);
          if (!selectedOption) {
            return value;
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showFlag && <span>{selectedOption.flag}</span>}
              <span>{selectedOption.name}</span>
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
              {showFlag && <span>{option.flag}</span>}
              <span>{option.name}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
