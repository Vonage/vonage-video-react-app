import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@ui/components/VividIcon';
import { VIDEO_CONTAINER_BUTTON_SIZE_WR } from '@utils/constants';
import hasMediaProcessorSupport from '@utils/hasMediaProcessorSupport';
import VideoContainerButton from '../../VideoContainerButton';
import { env } from '../../../../env';
import testIds from './testIds';

export { testIds };

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
    hasMediaProcessorSupport('video') && env.ALLOW_BACKGROUND_EFFECTS;
  const { t } = useTranslation();

  return (
    shouldDisplayBackgroundEffects && (
      <Box
        data-testid={testIds.container}
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
              <VividIcon
                name="background-blur-light-line"
                customSize={-5}
                className="text-vera-on-secondary"
                aria-hidden="true"
              />
            }
          />
        </Tooltip>
      </Box>
    )
  );
};

export default BackgroundEffectsButton;
