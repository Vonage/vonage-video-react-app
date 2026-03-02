import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import FooterLinks from '@components/FooterLinks';
import Stack from '@mui/material/Stack';
import useTheme from '@ui/theme';

/**
 * Footer Component
 *
 * This component returns a footer displaying footer links.
 * @returns {ReactElement} - the footer component.
 */
const Footer = (): ReactElement => {
  const theme = useTheme();

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
