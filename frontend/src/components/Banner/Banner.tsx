import { ReactElement } from 'react';
import BannerDateTime from '../BannerDateTime';
import BannerLinks from '../BannerLinks';
import BannerLogo from '../BannerLogo';
import BannerLanguage from '../BannerLanguage';

/**
 * Banner Component
 *
 * This component returns a banner that includes a logo, current date/time, language selector, and some links.
 * @returns {ReactElement} - the banner component.
 */
const Banner = (): ReactElement => {
  return (
    <div className="flex w-full flex-row justify-between">
      <BannerLogo />

      <div className="flex px-4">
        <BannerDateTime />
        <BannerLanguage />
        <BannerLinks />
      </div>
    </div>
  );
};

export default Banner;
