import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * LandingPageWelcome Component
 * This component includes a welcome message to the users visiting the landing page.
 * @returns {ReactElement} - the landing page component
 */
const LandingPageWelcome = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="h-auto max-w-xl shrink  py-4 ps-12 text-left">
      <h2 className="w-9/12 pb-5 text-5xl font-bold text-black">{t('landing.welcome.title')}</h2>
      <h3 className="text-lg text-slate-500">{t('landing.welcome.subtitle')}</h3>
    </div>
  );
};

export default LandingPageWelcome;
