import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { SUPPORTED_BROWSERS } from '../../../utils/constants';
import SupportedBrowserListItem from '../SupportedBrowserListItem';
import Card from '@ui/Card';

/**
 * SupportedBrowsers Component
 *
 * This component delineates all of the supported browsers for the Vonage Video API Reference App.
 * @returns {ReactElement} The SupportedBrowsers component.
 */
const SupportedBrowsers = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Card
      className="lg:max-w-125"
      sx={{
        display: 'block',
      }}
    >
      <Typography
        variant="h6"
        className="text-vera-text-secondary"
        sx={{
          paddingBottom: 2,
        }}
      >
        {t('unsupportedBrowser.supported.title')}
      </Typography>
      <List sx={{ overflowX: 'auto' }}>
        {SUPPORTED_BROWSERS.map(({ browser, link }) => {
          return <SupportedBrowserListItem key={browser} url={link} browser={browser} />;
        })}
      </List>
    </Card>
  );
};

export default SupportedBrowsers;
