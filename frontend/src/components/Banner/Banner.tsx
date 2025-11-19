import { ReactElement } from 'react';
import Box from '@ui/Box';
import Stack from '@ui/Stack';
import useCustomTheme from '@Context/Theme';
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
  const theme = useCustomTheme();

  return (
    <Header appBarProps={{ position: 'static' }} toolbarProps={{ sx: { alignItems: 'stretch' } }}>
      <Box sx={{ flex: 1, bgcolor: theme.colors.surface }}>
        <BannerLogo />
      </Box>

      <Box sx={{ flex: 1, bgcolor: { xs: theme.colors.surface, md: theme.colors.background } }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          sx={{
            height: '100%',
            bgcolor: { xs: theme.colors.surface, md: theme.colors.background },
            mr: 4,
          }}
        >
          <BannerLanguage />
        </Stack>
      </Box>
    </Header>
  );
};

export default Banner;
