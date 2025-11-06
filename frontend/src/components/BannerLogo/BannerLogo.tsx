import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import Box from '@ui/Box';

/**
 * BannerLogo Component
 *
 * This component returns a logo for the banner that navigates to the parent route when clicked.
 * @returns {ReactElement} - the banner logo component.
 */
const BannerLogo = (): ReactElement => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('..');
  };

  return (
    <Box
      data-testid="banner-logo"
      sx={{
        boxSizing: 'border-box',
        ml: { xs: 1, md: 6 },
        mt: { xs: 2, md: 5 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Box
        component="img"
        src={isMobile ? '/images/vonage-logo-mobile.svg' : '/images/vonage-logo-desktop.svg'}
        alt={isMobile ? 'Vonage-mobile-logo' : 'Vonage-desktop-logo'}
        onClick={handleClick}
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
