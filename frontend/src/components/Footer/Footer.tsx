import { ReactElement } from 'react';
import Box from '@ui/Box';
import FooterLinks from '@components/FooterLinks';
import Stack from '@ui/Stack';

/**
 * Footer Component
 *
 * This component returns a footer that includes a logo, current date/time, language selector, and some links.
 * @returns {ReactElement} - the footer component.
 */
const Footer = (): ReactElement => {
  return (
    <Stack direction="row" alignItems="center" data-testid="footer-content">
      <Box sx={{ flex: 1, bgcolor: 'background.paper', display: { xs: 'none', md: 'block' } }} />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          bgcolor: { xs: 'background.paper', md: 'primary.light' },
        }}
      >
        <FooterLinks />
      </Box>
    </Stack>
  );
};

export default Footer;
