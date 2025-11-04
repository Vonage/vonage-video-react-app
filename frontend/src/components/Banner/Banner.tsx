import { ReactElement } from 'react';
import { AppBar, Toolbar, Box, Stack } from '@mui/material';
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
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flex: 1, bgcolor: { xs: 'background.paper', md: 'primary.light' } }}>
          <BannerLogo />
        </Box>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          sx={{ flex: 1 }}
        >
          <BannerDateTime />
          <BannerLanguage />
          <BannerLinks />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Banner;
