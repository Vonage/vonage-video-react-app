import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';
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
type FooterLinksProps = ComponentProps<'div'> & {
  showVersion?: boolean;
};

const FooterLinks = ({
  className,
  showVersion = false,
  ...props
}: FooterLinksProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <div
      className={twMerge('flex items-center gap-2 py-2', className)}
      data-testid="footer-links"
      {...props}
    >
      <GHRepoButton />
      <span className="hidden min-[900px]:block text-vera-text-tertiary text-vera-body-base">
        {t('footer.github.title')}
      </span>
      <span
        data-testid="app-version"
        className={classNames('text-vera-text-tertiary text-vera-body-base', {
          'hidden min-[900px]:block': !showVersion,
        })}
      >
        {formatDisplayVersion(getAppVersion())} (SDK {sdkPackageInfo.version})
      </span>
    </div>
  );
};

export default FooterLinks;
