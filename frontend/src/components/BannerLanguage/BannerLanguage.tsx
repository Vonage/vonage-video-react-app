import { ReactElement } from 'react';
import LanguageSelector from '../LanguageSelector';

/**
 * BannerLanguage Component
 *
 * This component provides a language selection feature for the banner.
 * @returns {ReactElement} The BannerLanguage component.
 */
const BannerLanguage = (): ReactElement => {
  return (
    <div className="flex items-center" data-testid="banner-language">
      <LanguageSelector />
    </div>
  );
};

export default BannerLanguage;
