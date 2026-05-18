import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import VividIcon from '@ui/VividIcon';

/**
 * GHRepoButton Component
 *
 * Displays a button with a link to the Vonage Video React App GitHub page.
 * @returns {ReactElement} - The GHRepoButton component.
 */
const GHRepoButton = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Link href="https://github.com/Vonage/vonage-video-react-app/" target="_blank">
      <Tooltip title={t('githubTooltip')}>
        <IconButton aria-label={t('githubTooltip')}>
          <VividIcon
            name="github-mono"
            customSize={-4}
            style={{ color: 'var(--vera-text-secondary)' }}
          />
        </IconButton>
      </Tooltip>
    </Link>
  );
};

export default GHRepoButton;
