import { ReactElement } from 'react';
import BannerDateTime from '../BannerDateTime';
import BannerLinks from '../BannerLinks';
import BannerLogo from '../BannerLogo';

/**
 * Banner Component
 *
 * This component returns a banner that includes a logo, current date/time, and some links.
 * @returns {ReactElement} - the banner component.
 */
const Banner = (): ReactElement => {
  return (
    <div className="flex w-full flex-row justify-between">
      <BannerLogo />

      <div className="flex px-4">
        <BannerDateTime />
        <BannerLinks />
      </div>
    </div>
  );
};

export default Banner;
