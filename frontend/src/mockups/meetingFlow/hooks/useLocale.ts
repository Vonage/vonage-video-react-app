import { useTranslation } from 'react-i18next';

/**
 * Returns the active UI language, used to format dates and times.
 */
const useLocale = (): string => {
  const { i18n } = useTranslation();

  return i18n.language;
};

export default useLocale;
