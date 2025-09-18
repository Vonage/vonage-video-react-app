import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * UnsupportedBrowserMessage Component
 *
 * This component warns users they are using a browser unsupported by the Vonage Video API Reference App.
 * @returns {ReactElement} The UnsupportedBrowserMessage component.
 */
const UnsupportedBrowserMessage = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <div className="h-auto w-[400px] shrink py-4 ps-12 text-left">
      <h2 className="w-9/12 pb-5 text-5xl text-black">{t('unsupportedBrowser.header')}</h2>
      <h3 className="text-lg text-slate-500">{t('unsupportedBrowser.message')}</h3>
    </div>
  );
};

export default UnsupportedBrowserMessage;
