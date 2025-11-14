import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@ui/Box';
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
    <Box
      data-testid="banner-logo"
      sx={{
        boxSizing: 'border-box',
        ml: { xs: 1, md: 3 },
        mt: { xs: 2, md: 2 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Box
        data-testid="banner-logo-image"
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
