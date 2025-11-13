import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@ui/Box';
import MenuItem from '@ui/MenuItem';
import FormControl from '@ui/FormControl';
import Select from '@ui/Select';
import { SelectChangeEvent } from '@ui/SelectChangeEvent';
import { LanguageOption, LanguageSelectorProps } from './LanguageSelector.types';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';
import VividIcon from '../VividIcon/VividIcon';
import env from '../../env';

const languageOptions: LanguageOption[] = [
  { code: 'en', name: 'English', flag: 'flag-united-kingdom' },
  { code: 'en-US', name: 'English (US)', flag: 'flag-united-states' },
  { code: 'it', name: 'Italiano', flag: 'flag-italy' },
  { code: 'es', name: 'Español', flag: 'flag-spain' },
  { code: 'es-MX', name: 'Español (México)', flag: 'flag-mexico' },
];

/**
 * LanguageSelector Component
 * A dropdown component that allows users to select their preferred language.
 * The available languages are determined by the VITE_I18N_SUPPORTED_LANGUAGES environment variable.
 * @param {LanguageSelectorProps} props - The props for the component.
 * @property {boolean} showFlag - Whether to display the country flag alongside the language name.
 * @returns {ReactElement} The rendered LanguageSelector component.
 */
const LanguageSelector = ({ showFlag = true }: LanguageSelectorProps): ReactElement => {
  const { i18n } = useTranslation();
  const isSmallViewport = useIsSmallViewport();

  const supportedLanguages = languageOptions.filter((option) =>
    env.VITE_I18N_SUPPORTED_LANGUAGES.includes(option.code)
  );

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
  };

  const currentLanguage = i18n.language || 'en';

  return (
    <FormControl variant="outlined" size="small">
      <Select
        value={currentLanguage}
        onChange={handleLanguageChange}
        displayEmpty
        sx={(theme) => ({
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '& .MuiSelect-select': {
            backgroundColor: {
              xs: theme.palette.background.paper,
              md: theme.palette.primary.light,
            },
          },
        })}
        renderValue={(value) => {
          const selectedOption = supportedLanguages.find((option) => option.code === value);
          if (!selectedOption) {
            return value;
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showFlag && <VividIcon name={selectedOption.flag} customSize={-3} />}
              {!isSmallViewport && selectedOption.name}
            </Box>
          );
        }}
        data-testid="language-selector"
      >
        {supportedLanguages.map((option) => (
          <MenuItem
            key={option.code}
            value={option.code}
            data-testid={`language-option-${option.code}`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showFlag && <VividIcon name={option.flag} customSize={-5} />}
              {option.name}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
