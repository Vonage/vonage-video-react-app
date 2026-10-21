import type { ReactElement } from 'react';
import Divider from '@mui/material/Divider';
import { Header } from '@ui';
import BannerLogo from '../BannerLogo';
import BannerLanguage from '../BannerLanguage';
import BannerLogout from '../BannerLogout';
import { env } from '../../env';

/**
 * Banner Component
 *
 * This component returns a banner that includes a logo, a log-out action when auth is enabled,
 * and the language selector.
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

      <div className="bg-vera-surface vera-desktop:bg-vera-background! flex-1 max-sm:p-6 p-10 flex justify-end items-center gap-4 h-full">
        {env.AUTH_ENABLED && (
          <>
            <BannerLogout />
            <Divider orientation="vertical" flexItem variant="middle" />
          </>
        )}
        <BannerLanguage
          // necessary to align the down arrow of the selector with the layout padding on mobile
          className="max-sm:-mr-2"
        />
      </div>
    </Header>
  );
};

export default Banner;
