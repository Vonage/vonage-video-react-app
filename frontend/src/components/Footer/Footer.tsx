import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import FooterLinks from '@components/FooterLinks';
import Stack from '@mui/material/Stack';

/**
 * Footer Component
 *
 * This component returns a footer displaying footer links.
 * @returns {ReactElement} - the footer component.
 */
const Footer = (): ReactElement => {
  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
      data-testid="footer-content"
      className="bg-vera-background"
    >
      <Box
        className="bg-vera-surface"
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'block' },
          minHeight: '60px',
        }}
      />

      <Box
        className="bg-vera-surface vera-desktop:bg-vera-background"
        sx={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <FooterLinks />
      </Box>
    </Stack>
  );
};

export default Footer;
