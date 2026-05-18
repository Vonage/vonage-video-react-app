import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { ReactElement } from 'react';
import PortraitIcon from '@mui/icons-material/Portrait';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { VIDEO_CONTAINER_BUTTON_SIZE_WR } from '@utils/constants';
import VideoContainerButton from '../../VideoContainerButton';
import { env } from '../../../../env';

export type BackgroundEffectsButtonProps = {
  onClick: () => void;
};

/**
 * BackgroundEffectsButton Component
 *
 * If the user's device supports the Vonage Media Processor, displays a button to modify background effects.
 * @param {BackgroundEffectsButtonProps} props - The props for the component.
 *   @property {Function} onClick - Function to call when the button is clicked.
 * @returns {ReactElement | false} - The BackgroundEffectsButton component.
 */
const BackgroundEffectsButton = ({
  onClick,
}: BackgroundEffectsButtonProps): ReactElement | false => {
  const shouldDisplayBackgroundEffects =
    hasMediaProcessorSupport('both') && env.ALLOW_BACKGROUND_EFFECTS;
  const { t } = useTranslation();

  return (
    shouldDisplayBackgroundEffects && (
      <Box
        className="border border-vera-on-secondary"
        sx={{
          display: 'flex',
          width: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          height: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <Tooltip
          arrow
          title={t('backgroundEffects.title')}
          aria-label={t('backgroundEffects.title')}
        >
          <VideoContainerButton
            onClick={onClick}
            className="hover:bg-[color-mix(in_srgb,var(--vera-on-secondary)_60%,transparent)]!"
            icon={
              <PortraitIcon
                sx={{ fontSize: '24px' }}
                className="text-vera-on-secondary"
                data-testid="portraitIcon"
              />
            }
          />
        </Tooltip>
      </Box>
    )
  );
};

export default BackgroundEffectsButton;
