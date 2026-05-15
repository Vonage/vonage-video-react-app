import type { ReactElement } from 'react';
import Header from '@ui/Header';
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
    <Header
      appBarProps={{
        position: 'static',
        className: 'banner-header',
      }}
    >
      <div className="bg-vera-surface flex-1 max-sm:p-6 p-10">
        <BannerLogo />
      </div>

      <div className="bg-vera-surface vera-desktop:bg-vera-background! flex-1 max-sm:p-6 p-10 flex justify-end items-center h-full">
        <BannerLanguage
          // necessary to align the down arrow of the selector with the layout padding on mobile
          className="max-sm:-mr-2"
        />
      </div>
    </Header>
  );
};

export default Banner;
