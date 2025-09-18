import { IconButton, Link, Tooltip } from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

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
        <IconButton color="default">
          <GitHubIcon />
        </IconButton>
      </Tooltip>
    </Link>
  );
};

export default GHRepoButton;
