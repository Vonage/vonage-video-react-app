import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import List from '@ui/List';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import useCustomTheme from '@Context/Theme';
import { SUPPORTED_BROWSERS } from '../../../utils/constants';
import SupportedBrowserListItem from '../SupportedBrowserListItem';

/**
 * SupportedBrowsers Component
 *
 * This component delineates all of the supported browsers for the Vonage Video API Reference App.
 * @returns {ReactElement} The SupportedBrowsers component.
 */
const SupportedBrowsers = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useCustomTheme();

  return (
    <Box
      sx={{
        flexShrink: 1,
        width: { xs: '100%', md: '90%' },
        px: 5,
        pt: 3,
        pb: 1,
        textAlign: 'left',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.shapes.borderRadiusMedium,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          paddingBottom: 2,
          color: theme.colors.textSecondary,
        }}
      >
        {t('unsupportedBrowser.supported.title')}
      </Typography>
      <List sx={{ overflowX: 'auto' }}>
        {SUPPORTED_BROWSERS.map(({ browser, link }) => {
          return <SupportedBrowserListItem key={browser} url={link} browser={browser} />;
        })}
      </List>
    </Box>
  );
};

export default SupportedBrowsers;
