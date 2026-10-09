import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { twMerge } from 'tailwind-merge';
import VividIcon from '@ui/components/VividIcon';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';
import { env } from '../../env';

const SIGN_OUT_PATH = '/auth/signout';

type BannerLogoutProps = Omit<ComponentProps<typeof Button>, 'onClick'>;

/**
 * Banner "Log out" action. A full navigation (not a fetch), because sign-out ends with a redirect
 * to the auth provider. Visibility is decided by the parent.
 */
const BannerLogout = ({ className, ...props }: BannerLogoutProps): ReactElement => {
  const { t } = useTranslation();
  const isSmallViewport = useIsSmallViewport();
  const label = t('banner.logout');

  const handleLogout = () => {
    window.location.assign(`${env.API_URL}${SIGN_OUT_PATH}`);
  };

  return (
    <Button
      variant="text"
      onClick={handleLogout}
      aria-label={label}
      data-testid="banner-logout"
      startIcon={<VividIcon name="exit-line" customSize={-5} />}
      className={twMerge('normal-case! text-vera-text-secondary! text-vera-body-base', className)}
      {...props}
    >
      {!isSmallViewport && label}
    </Button>
  );
};

export default BannerLogout;
