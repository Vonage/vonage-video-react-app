import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '@ui/Tooltip';
import Link from '@ui/Link';
import IconButton from '@ui/IconButton';
import VividIcon from '@components/VividIcon';

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
        <IconButton aria-label="GitHub Repository">
          <VividIcon name="github-mono" customSize={-4} />
        </IconButton>
      </Tooltip>
    </Link>
  );
};

export default GHRepoButton;
