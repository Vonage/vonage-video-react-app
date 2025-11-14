import { ReactElement } from 'react';
import { Link } from 'react-router-dom';

/**
 * BannerLogo Component
 *
 * This component returns the logo that redirects to the landing page when clicked.
 * @returns {ReactElement} - the banner logo component
 */
const BannerLogo = (): ReactElement => (
  <Link to="..">
    <div className="box-border" data-testid="banner-logo">
      <img
        style={{
          marginLeft: '16px',
          marginTop: '12px',
        }}
        className="hidden h-[72px] pl-4 pr-8 md:flex"
        src="/images/vonage-logo-desktop.svg"
        alt="Vonage-desktop-logo"
      />
      <img
        className="my-4 h-10 px-8 md:hidden"
        src="/images/vonage-logo-mobile.svg"
        alt="Vonage-mobile-logo"
      />
    </div>
  </Link>
);

export default BannerLogo;
