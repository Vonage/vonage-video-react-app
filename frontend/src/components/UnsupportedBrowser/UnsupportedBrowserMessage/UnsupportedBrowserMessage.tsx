import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@ui/theme';

/**
 * UnsupportedBrowserMessage Component
 *
 * This component warns users they are using a browser unsupported by the Vonage Video API Reference App.
 * @returns {ReactElement} The UnsupportedBrowserMessage component.
 */
const UnsupportedBrowserMessage = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        maxWidth: '80%',
        pl: { xs: 0, lg: 4 },
        mb: { xs: 0, md: 16 },
        ml: { xs: 0, md: 2 },
        textAlign: 'left',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          pb: { xs: 0, md: 5 },
          color: theme.colors.textSecondary,
        }}
      >
        {t('unsupportedBrowser.header')}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          color: theme.colors.textTertiary,
          display: {
            xs: 'none',
            sm: 'block',
          },
        }}
      >
        {t('unsupportedBrowser.message')}
      </Typography>
    </Box>
  );
};

export default UnsupportedBrowserMessage;
