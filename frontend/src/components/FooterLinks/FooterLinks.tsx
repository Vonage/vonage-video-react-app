import { ReactElement } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import GHRepoButton from '../GHRepoButton';
import getAppVersion from '@utils/getAppVersion';
import sdkPackageInfo from '@vonage/client-sdk-video/package.json';

/**
 * FooterLinks Component
 *
 * Component holding different icon-buttons.
 * @returns {ReactElement} The FooterLinks component.
 */
const FooterLinks = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" alignItems="center" data-testid="footer-links" className="py-2">
      <GHRepoButton />
      <Typography
        variant="body2"
        className="hidden md:block ml-2 text-vera-text-tertiary text-sm"
      >
        {t('footer.github.title')}
      </Typography>
      <Typography
        variant="body2"
        data-testid="app-version"
        className="hidden md:block ml-2 text-vera-text-tertiary text-sm"
      >
        {getAppVersion().replace('vera-', 'v')} (SDK {sdkPackageInfo.version})
      </Typography>
    </Stack>
  );
};

export default FooterLinks;
