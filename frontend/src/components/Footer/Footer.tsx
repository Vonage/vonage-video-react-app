import { ReactElement } from 'react';
import Box from '@ui/Box';
import FooterLinks from '@components/FooterLinks';
import Stack from '@ui/Stack';
import useCustomTheme from '@Context/Theme';

/**
 * Footer Component
 *
 * This component returns a footer that includes a logo, current date/time, language selector, and some links.
 * @returns {ReactElement} - the footer component.
 */
const Footer = (): ReactElement => {
  const theme = useCustomTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      data-testid="footer-content"
      sx={{
        bgcolor: theme.colors.background,
      }}
    >
      <Box
        sx={{
          flex: 1,
          bgcolor: theme.colors.surface,
          display: { xs: 'none', md: 'block' },
          minHeight: '60px',
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          bgcolor: { xs: theme.colors.surface, md: theme.colors.background },
        }}
      >
        <FooterLinks />
      </Box>
    </Stack>
  );
};

export default Footer;
