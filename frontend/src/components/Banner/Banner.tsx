import { ReactElement } from 'react';
import Box from '@mui/material/Box';
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
      <Box
        className="bg-vera-surface"
        sx={{
          flex: 1,
          p: { xs: 3, sm: 5 },
        }}
      >
        <BannerLogo />
      </Box>

      <Box
        className="bg-vera-surface vera-desktop:bg-vera-background"
        sx={{
          flex: 1,
          p: { xs: 3, sm: 5 },
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <BannerLanguage
          sx={{
            mr: {
              // necessary to align the down arrow of the selector with the layout padding
              xs: '-8px',
              sm: 'unset',
            },
          }}
        />
      </Box>
    </Header>
  );
};

export default Banner;
