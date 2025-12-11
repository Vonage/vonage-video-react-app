import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@ui/Box';
import MenuItem from '@ui/MenuItem';
import FormControl from '@ui/FormControl';
import Select from '@ui/Select';
import { SelectChangeEvent } from '@ui/SelectChangeEvent';
import useTheme from '@ui/theme';
import { SvgIconProps } from '@mui/material';
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

const ChevronDownIcon = (props: SvgIconProps, theme: ReturnType<typeof useTheme>) => (
  <VividIcon
    name="chevron-down-line"
    customSize={-5}
    {...props}
    sx={{ color: theme.colors.secondary }}
  />
);

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
  const theme = useTheme();
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
        IconComponent={(props: SvgIconProps) => ChevronDownIcon(props, theme)}
        displayEmpty
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '& .MuiSelect-select': {
            backgroundColor: {
              xs: theme.colors.surface,
              md: theme.colors.background,
            },
          },
        }}
        renderValue={(value) => {
          const selectedOption = supportedLanguages.find((option) => option.code === value);
          if (!selectedOption) {
            return value;
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showFlag && <VividIcon name={selectedOption.flag} customSize={-2} />}
              {!isSmallViewport && <span>{selectedOption.name}</span>}
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
              {showFlag && <VividIcon name={option.flag} customSize={-2} />}
              <span>{option.name}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
