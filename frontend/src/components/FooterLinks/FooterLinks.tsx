import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import GHRepoButton from '../GHRepoButton';
import getAppVersion from '@utils/getAppVersion';
import sdkPackageInfo from '@vonage/client-sdk-video/package.json';

const formatDisplayVersion = (version: string): string => version.replace(/^vera-/, 'v');

/**
 * FooterLinks Component
 *
 * Component holding different icon-buttons.
 * @returns {ReactElement} The FooterLinks component.
 */
const FooterLinks = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 py-2" data-testid="footer-links">
      <GHRepoButton />
      <span className="hidden min-[900px]:block text-vera-text-tertiary text-vera-body-base">
        {t('footer.github.title')}
      </span>
      <span
        data-testid="app-version"
        className="hidden min-[900px]:block text-vera-text-tertiary text-vera-body-base"
      >
        {formatDisplayVersion(getAppVersion())} (SDK {sdkPackageInfo.version})
      </span>
    </div>
  );
};

export default FooterLinks;
