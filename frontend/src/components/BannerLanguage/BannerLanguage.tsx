import { ReactElement } from 'react';
import Box from '@ui/Box';
import LanguageSelector from '../LanguageSelector';

/**
 * BannerLanguage Component
 *
 * This component provides a language selection feature for the banner.
 * @returns {ReactElement} The BannerLanguage component.
 */
const BannerLanguage = (): ReactElement => {
  return (
    <Box display="flex" alignItems="center" data-testid="banner-language">
      <LanguageSelector />
    </Box>
  );
};

export default BannerLanguage;
