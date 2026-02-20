import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import Header from '@ui/Header';
import BannerLogo from '../BannerLogo';
import BannerLanguage from '../BannerLanguage';
import useTheme from '@ui/theme';

/**
 * Banner Component
 *
 * This component returns a banner that includes a logo, current date/time, language selector, and some links.
 * @returns {ReactElement} - the banner component.
 */
const Banner = (): ReactElement => {
  const theme = useTheme();

  return (
    <Header
      appBarProps={{
        position: 'static',
        className: 'banner-header',
      }}
    >
      <Box
        flex={1}
        sx={{
          bgcolor: theme.colors.surface,
          p: { xs: 3, sm: 5 },
        }}
      >
        <BannerLogo />
      </Box>

      <Box
        flex={1}
        sx={{
          bgcolor: {
            xs: theme.colors.surface,
            md: theme.colors.background,
          },
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
