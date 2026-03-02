import { ReactElement, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useTheme from '@ui/theme';
import usePublisherContext from '../../../hooks/usePublisherContext';
import BackgroundVideoContainer from '../BackgroundVideoContainer';
import BackgroundEffectOptions from '../BackgroundEffectOptions/BackgroundEffectOptions';
import getInitialBackgroundFilter from '../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import useBackgroundPublisherContext from '../../../hooks/useBackgroundPublisherContext';
import RightPanelTitle from '../../MeetingRoom/RightPanel/RightPanelTitle';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';

export type BackgroundEffectsLayoutProps = {
  isOpen: boolean;
  handleClose: () => void;
  mode: 'meeting' | 'waiting';
};

/**
 * BackgroundEffectsLayout Component
 *
 * This component provides a layout for managing background effects, including video preview,
 * effect selection tabs, and action buttons.
 * @param {BackgroundEffectsLayoutProps} props - The properties for the component.
 *   @property {boolean} isOpen - Whether the background effects layout is open.
 *   @property {Function} handleClose - Function to close the background effects layout.
 *   @property {string} mode - The mode of the background effects ('meeting' or 'waiting').
 * @returns {ReactElement | false} The background effects layout component or false if not open.
 */
const BackgroundEffectsLayout = ({
  isOpen,
  handleClose,
  mode,
}: BackgroundEffectsLayoutProps): ReactElement | false => {
  const { t } = useTranslation();
  const theme = useTheme();

  const isShortScreen = useMediaQuery('(max-height:825px)');
  const publisherContext = usePublisherContext();
  const previewPublisherContext = usePreviewPublisherContext();

  const { publisher, changeBackground, isVideoEnabled } =
    mode === 'meeting' ? publisherContext : previewPublisherContext;

  const {
    publisherVideoElement,
    changeBackground: changeBackgroundPreview,
    backgroundSelected,
    setBackgroundSelected,
  } = useBackgroundPublisherContext();

  const handleApplyBackgroundSelect = () => {
    void changeBackground(backgroundSelected);
    handleClose();
  };

  const setInitialBackgroundReplacement = useCallback(() => {
    const selectedBackgroundOption = getInitialBackgroundFilter(publisher);
    setBackgroundSelected(selectedBackgroundOption);
    return selectedBackgroundOption;
  }, [publisher, setBackgroundSelected]);

  useEffect(() => {
    if (isOpen) {
      const currentOption = setInitialBackgroundReplacement();
      void changeBackgroundPreview(currentOption);
    }
  }, [isOpen, publisher, changeBackgroundPreview, setInitialBackgroundReplacement]);

  const buttonGroup = (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'end',
      }}
    >
      <Button
        data-testid="background-effect-cancel-button"
        variant="text"
        sx={{ mr: 1, color: theme.colors.textSecondary }}
        onClick={() => {
          const currentOption = setInitialBackgroundReplacement();
          void changeBackgroundPreview(currentOption);
          handleClose();
        }}
      >
        {t('button.cancel')}
      </Button>
      <Button
        data-testid="background-effect-apply-button"
        variant="contained"
        sx={{ color: theme.colors.onPrimary, ml: 2 }}
        onClick={handleApplyBackgroundSelect}
      >
        {t('button.apply')}
      </Button>
    </Box>
  );

  if (!isOpen) {
    return false;
  }

  // MeetingRoom layout
  if (mode === 'meeting') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: isShortScreen ? 'auto' : 'hidden',
        }}
      >
        <RightPanelTitle title={t('backgroundEffects.title')} handleClose={handleClose} />

        <Box sx={{ flexShrink: 0, p: 2 }}>
          <BackgroundVideoContainer
            publisherVideoElement={publisherVideoElement}
            isParentVideoEnabled={isVideoEnabled}
          />
        </Box>

        <BackgroundEffectOptions mode={mode} />

        {buttonGroup}
      </Box>
    );
  }

  // WaitingRoom layout
  return (
    <>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
        <Box
          flex={1}
          minWidth={0}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box
            flexGrow={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={0}
          >
            <BackgroundVideoContainer
              publisherVideoElement={publisherVideoElement}
              isParentVideoEnabled={isVideoEnabled}
              isFixedWidth
            />
          </Box>
        </Box>

        <BackgroundEffectOptions mode={mode} />
      </Box>
      {buttonGroup}
    </>
  );
};

export default BackgroundEffectsLayout;
