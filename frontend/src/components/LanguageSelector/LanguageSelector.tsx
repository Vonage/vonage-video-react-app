import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { LanguageOption, LanguageSelectorProps } from './LanguageSelector.types';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';
import VividIcon from '@ui/VividIcon';
import { env } from '../../env';

const languageOptions: LanguageOption[] = [
  { code: 'en', name: 'English', flag: 'flag-united-kingdom' },
  { code: 'en-US', name: 'English (US)', flag: 'flag-united-states' },
  { code: 'de', name: 'Deutsch', flag: 'flag-germany' },
  { code: 'it', name: 'Italiano', flag: 'flag-italy' },
  { code: 'es', name: 'Español', flag: 'flag-spain' },
  { code: 'es-MX', name: 'Español (México)', flag: 'flag-mexico' },
];

const ChevronIcon = ({ className, ...props }: { className?: string } & Record<string, unknown>) => (
  <span
    className={className}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    {...props}
  >
    <VividIcon
      name="chevron-down-line"
      customSize={-5}
      style={{ color: 'var(--vera-text-secondary)' }}
    />
  </span>
);

const SelectIconComponent =
  (_iconClassName: string) =>
  (props: Record<string, unknown>): ReactElement => <ChevronIcon {...props} />;

/**
 * LanguageSelector Component
 * A dropdown component that allows users to select their preferred language.
 * The available languages are determined by the I18N_SUPPORTED_LANGUAGES environment variable.
 * @param {LanguageSelectorProps} props - The props for the component.
 * @property {boolean} showFlag - Whether to display the country flag alongside the language name.
 * @returns {ReactElement} The rendered LanguageSelector component.
 */
const LanguageSelector = ({ showFlag = true }: LanguageSelectorProps): ReactElement => {
  const { i18n } = useTranslation();
  const isSmallViewport = useIsSmallViewport();

  const supportedLanguages = languageOptions.filter((option) =>
    env.I18N_SUPPORTED_LANGUAGES.includes(option.code)
  );

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value;
    void i18n.changeLanguage(newLanguage);
  };

  const currentLanguage = i18n.language || 'en';

  return (
    <FormControl variant="outlined" size="small">
      <Select
        value={currentLanguage}
        onChange={handleLanguageChange}
        IconComponent={SelectIconComponent('text-vera-text-secondary')}
        displayEmpty
        className="bg-transparent! *:border-none!"
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
