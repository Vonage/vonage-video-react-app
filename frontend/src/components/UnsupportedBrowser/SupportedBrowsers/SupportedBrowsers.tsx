import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import List from '@ui/List';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import useMediaQuery from '@ui/useMediaQuery';
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
  const isMdUp = useMediaQuery('(min-width:768px)');
  const theme = useCustomTheme();

  return (
    <Box
      sx={{
        height: 'auto',
        width: '400px',
        flexShrink: 1,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 6,
        textAlign: 'left',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          width: '100%',
          paddingBottom: 2.5,
          color: theme.colors.textSecondary,
        }}
      >
        {t('unsupportedBrowser.supported.title')}
      </Typography>

      <Box
        sx={{
          maxHeight: isMdUp ? '480px' : 'none',
          overflowY: isMdUp ? 'auto' : 'visible',
        }}
      >
        <List sx={{ overflowX: 'auto' }}>
          {SUPPORTED_BROWSERS.map(({ browser, link }) => {
            return <SupportedBrowserListItem key={browser} url={link} browser={browser} />;
          })}
        </List>
      </Box>
    </Box>
  );
};

export default SupportedBrowsers;
