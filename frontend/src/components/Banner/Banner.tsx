import { ReactElement } from 'react';
import { AppBar, AppBarProps, Toolbar } from '@mui/material';
import Box from '@ui/Box';
import Stack from '@ui/Stack';
import useCustomTheme from '@Context/Theme';
import BannerDateTime from '../BannerDateTime';
import BannerLinks from '../BannerLinks';
import BannerLogo from '../BannerLogo';
import BannerLanguage from '../BannerLanguage';
import classNames from 'classnames';

type BannerProps = AppBarProps;

/**
 * Banner Component
 *
 * This component returns a banner that includes a logo, current date/time, language selector, and some links.
 * @param root0 - Props for the Banner component.
 * @param {string} root0.className - Additional CSS class names to apply to the banner container.
 * @returns {ReactElement} - the banner component.
 */
const Banner: React.FC<BannerProps> = ({ className, ...props }): ReactElement => {
  const theme = useCustomTheme();

  // [TODO]: check-styles 'flex w-full flex-row justify-between'
  return (
    <AppBar position="static" className={classNames(className)} {...props}>
      <Toolbar sx={{ alignItems: 'stretch' }}>
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
            }}
          >
            <BannerDateTime />
            <BannerLanguage />
            <BannerLinks />
          </Stack>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Banner;
