import { ReactElement } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
    <Stack direction="row" alignItems="center" data-testid="footer-links" className="gap-2 py-2">
      <GHRepoButton />
      <Typography
        variant="body2"
        className="hidden min-[900px]:block text-vera-text-tertiary text-vera-body-base"
      >
        {t('footer.github.title')}
      </Typography>
      <Typography
        variant="body2"
        data-testid="app-version"
        className="hidden min-[900px]:block text-vera-text-tertiary text-vera-body-base"
      >
        {formatDisplayVersion(getAppVersion())} (SDK {sdkPackageInfo.version})
      </Typography>
    </Stack>
  );
};

export default FooterLinks;
