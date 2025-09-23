import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import usePublisherContext from '../../../hooks/usePublisherContext';
import BackgroundVideoContainer from '../BackgroundVideoContainer';
import BackgroundEffectTabs, {
  clearBgWhenSelectedDeleted,
} from '../BackgroundEffectTabs/BackgroundEffectTabs';
import getInitialBackgroundFilter from '../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import useBackgroundPublisherContext from '../../../hooks/useBackgroundPublisherContext';
import RightPanelTitle from '../../MeetingRoom/RightPanel/RightPanelTitle';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';

export type BackgroundEffectsLayoutProps = {
  isOpen: boolean;
  handleClose: () => void;
  mode: 'meeting' | 'waiting';
};

const BackgroundEffectsLayout = ({
  isOpen,
  handleClose,
  mode,
}: BackgroundEffectsLayoutProps): ReactElement | false => {
  const [tabSelected, setTabSelected] = useState<number>(0);
  const [backgroundSelected, setBackgroundSelected] = useState<string>('none');
  const { t } = useTranslation();

  const isShortScreen = useMediaQuery('(max-height:825px)');
  const isTabletViewport = useMediaQuery('(max-width:899px)');

  const publisherContext = usePublisherContext();
  const previewPublisherContext = usePreviewPublisherContext();

  const { publisher, changeBackground, isVideoEnabled } =
    mode === 'meeting' ? publisherContext : previewPublisherContext;

  const { publisherVideoElement, changeBackground: changeBackgroundPreview } =
    useBackgroundPublisherContext();

  const handleBackgroundSelect = (selectedBackgroundOption: string) => {
    setBackgroundSelected(selectedBackgroundOption);
    changeBackgroundPreview(selectedBackgroundOption);
  };

  const handleApplyBackgroundSelect = () => {
    changeBackground(backgroundSelected);
    handleClose();
  };

  const customBackgroundImageChange = (dataUrl: string) => {
    setTabSelected(0);
    handleBackgroundSelect(dataUrl);
  };

  const setInitialBackgroundReplacement = useCallback(() => {
    const selectedBackgroundOption = getInitialBackgroundFilter(publisher);
    setBackgroundSelected(selectedBackgroundOption);
    return selectedBackgroundOption;
  }, [publisher]);

  useEffect(() => {
    if (isOpen) {
      const currentOption = setInitialBackgroundReplacement();
      changeBackgroundPreview(currentOption);
    }
  }, [isOpen, publisher, changeBackgroundPreview, setInitialBackgroundReplacement]);

  const buttonGroup = (
    <Box
      sx={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        ...(mode === 'waiting' ? { mt: 1.5 } : { m: 1.5 }),
      }}
    >
      <Button
        data-testid="background-effect-cancel-button"
        variant="outlined"
        color="primary"
        sx={{ width: '100%', mr: 1 }}
        onClick={() => {
          const currentOption = setInitialBackgroundReplacement();
          changeBackgroundPreview(currentOption);
          handleClose();
        }}
      >
        {t('button.cancel')}
      </Button>
      <Button
        data-testid="background-effect-apply-button"
        variant="contained"
        color="primary"
        sx={{ width: '100%' }}
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

        <Box sx={{ flexShrink: 0, p: 1.5 }}>
          <BackgroundVideoContainer
            publisherVideoElement={publisherVideoElement}
            isParentVideoEnabled={isVideoEnabled}
          />
        </Box>

        <BackgroundEffectTabs
          tabSelected={tabSelected}
          setTabSelected={setTabSelected}
          mode={mode}
          backgroundSelected={backgroundSelected}
          setBackgroundSelected={handleBackgroundSelect}
          cleanupSelectedBackgroundReplacement={(dataUrl: string) =>
            clearBgWhenSelectedDeleted(publisher, changeBackground, backgroundSelected, dataUrl)
          }
          customBackgroundImageChange={customBackgroundImageChange}
        />

        {buttonGroup}
      </Box>
    );
  }

  // WaitingRoom layout
  return (
    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
      <Box
        flex={1}
        minWidth={0}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center" minHeight={0}>
          <BackgroundVideoContainer
            publisherVideoElement={publisherVideoElement}
            isParentVideoEnabled={isVideoEnabled}
            isFixedWidth
          />
        </Box>
        {!isTabletViewport && buttonGroup}
      </Box>

      <BackgroundEffectTabs
        tabSelected={tabSelected}
        setTabSelected={setTabSelected}
        mode={mode}
        backgroundSelected={backgroundSelected}
        setBackgroundSelected={handleBackgroundSelect}
        cleanupSelectedBackgroundReplacement={(dataUrl: string) =>
          clearBgWhenSelectedDeleted(publisher, changeBackground, backgroundSelected, dataUrl)
        }
        customBackgroundImageChange={customBackgroundImageChange}
      />

      {isTabletViewport && buttonGroup}
    </Box>
  );
};

export default BackgroundEffectsLayout;
