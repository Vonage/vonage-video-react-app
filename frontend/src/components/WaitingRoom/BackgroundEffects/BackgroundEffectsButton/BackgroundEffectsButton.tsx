import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { ReactElement } from 'react';
import PortraitIcon from '@mui/icons-material/Portrait';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import useTheme from '@ui/theme';
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
  const shouldDisplayBackgroundEffects = hasMediaProcessorSupport() && env.ALLOW_BACKGROUND_EFFECTS;
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    shouldDisplayBackgroundEffects && (
      <Box
        sx={{
          display: 'flex',
          width: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          height: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          borderRadius: '50%',
          border: `1px solid ${theme.colors.onSecondary}`,
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
            sx={{
              '&:hover': {
                backgroundColor: `${theme.colors.onSecondary}99`,
              },
            }}
            icon={
              <PortraitIcon
                sx={{ fontSize: '24px', color: theme.colors.onSecondary }}
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
