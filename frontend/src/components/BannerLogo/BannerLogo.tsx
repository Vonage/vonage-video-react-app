import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import useIsTabletViewport from '@hooks/useIsTabletViewport';

/**
 * BannerLogo Component
 *
 * This component returns a logo for the banner that navigates to the parent route when clicked.
 * @returns {ReactElement} - the banner logo component.
 */
const BannerLogo = (): ReactElement => {
  const isTablet = useIsTabletViewport();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('..');
  };

  return (
    <Box data-testid="banner-logo">
      <Box
        data-testid="banner-logo-image"
        className="dark:invert"
        component="img"
        src={isTablet ? '/images/vonage-logo-mobile.svg' : '/images/vonage-logo-desktop.svg'}
        alt={isTablet ? 'Vonage-mobile-logo' : 'Vonage-desktop-logo'}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        sx={{
          height: { xs: 40, md: 72 },
          display: 'block',
          cursor: 'pointer',
        }}
      />
    </Box>
  );
};

export default BannerLogo;
