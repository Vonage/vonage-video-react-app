import { ReactElement } from 'react';
import { List } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  return (
    <div className="h-auto w-[400px] shrink py-4 ps-12 text-left">
      <h3 className="w-full pb-5 text-4xl text-black">{t('unsupportedBrowser.supported.title')}</h3>

      <div className="md:max-h-[480px] md:overflow-y-auto ">
        <List sx={{ overflowX: 'auto' }}>
          {SUPPORTED_BROWSERS.map(({ browser, link }) => {
            return <SupportedBrowserListItem key={browser} url={link} browser={browser} />;
          })}
        </List>
      </div>
    </div>
  );
};

export default SupportedBrowsers;
