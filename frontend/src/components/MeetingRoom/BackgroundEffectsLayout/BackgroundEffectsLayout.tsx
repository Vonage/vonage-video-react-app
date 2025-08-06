import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, Tab, Tabs, useMediaQuery } from '@mui/material';
import usePublisherContext from '../../../hooks/usePublisherContext';
import RightPanelTitle from '../RightPanel/RightPanelTitle';
import EffectOptionButtons from '../../BackgroundEffects/EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../../BackgroundEffects/BackgroundGallery/BackgroundGallery';
import BackgroundVideoContainer from '../../BackgroundEffects/BackgroundVideoContainer';
import useBackgroundPublisherContext from '../../../hooks/useBackgroundPublisherContext';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../utils/constants';
import getInitialBackgroundFilter from '../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import AddBackgroundEffectLayout from '../../BackgroundEffects/AddBackgroundEffect/AddBackgroundEffectLayout/AddBackgroundEffectLayout';

export type BackgroundEffectsLayoutProps = {
  handleClose: () => void;
  isOpen: boolean;
};

const BackgroundEffectsLayout = ({
  handleClose,
  isOpen,
}: BackgroundEffectsLayoutProps): ReactElement | false => {
  const [tabSelected, setTabSelected] = useState<number>(0);
  const [backgroundSelected, setBackgroundSelected] = useState<string>('none');
  const isShortScreen = useMediaQuery('(max-height:825px)');
  const { publisher, changeBackground, isVideoEnabled } = usePublisherContext();
  const { publisherVideoElement, changeBackground: changeBackgroundPreview } =
    useBackgroundPublisherContext();

  const handleBackgroundSelect = (selectedBackgroundOption: string) => {
    setBackgroundSelected(selectedBackgroundOption);
    changeBackgroundPreview(selectedBackgroundOption);
  };

  const handleApplyBackgroundSelect = async () => {
    changeBackground(backgroundSelected);
    handleClose();
  };

  const setInitialBackgroundReplacement = useCallback(() => {
    const selectedBackgroundOption = getInitialBackgroundFilter(publisher);
    setBackgroundSelected(selectedBackgroundOption);
    return selectedBackgroundOption;
  }, [publisher, setBackgroundSelected]);

  const publisherVideoFilter = publisher?.getVideoFilter();

  useEffect(() => {
    if (isOpen) {
      const currentOption = setInitialBackgroundReplacement();
      changeBackgroundPreview(currentOption);
    }
  }, [publisherVideoFilter, isOpen, changeBackgroundPreview, setInitialBackgroundReplacement]);

  if (!isOpen) {
    return false;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: isShortScreen ? 'auto' : 'hidden',
      }}
    >
      <RightPanelTitle title="Background Effects" handleClose={handleClose} />

      <Box sx={{ flexShrink: 0, p: 1.5 }}>
        <BackgroundVideoContainer
          publisherVideoElement={publisherVideoElement}
          isParentVideoEnabled={isVideoEnabled}
        />
      </Box>

      <Box sx={{ flexShrink: 0, px: 1.5 }}>
        <Tabs
          variant="fullWidth"
          value={tabSelected}
          onChange={(_event, newValue) => setTabSelected(newValue)}
          aria-label="backgrounds tabs"
          sx={{ '& .MuiTab-root': { textTransform: 'none' } }}
        >
          <Tab label="Backgrounds" />
          <Tab label="Add Background" />
        </Tabs>
      </Box>

      <Box
        className="choose-background-effect-box"
        sx={{
          minHeight: '125px',
          overflowY: 'auto',
          m: 1.5,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${DEFAULT_SELECTABLE_OPTION_WIDTH}px, 1fr))`,
          gap: 1,
        }}
      >
        {tabSelected === 0 && (
          <>
            <EffectOptionButtons
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
            />
            <BackgroundGallery
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
            />
          </>
        )}
        {tabSelected === 1 && <AddBackgroundEffectLayout />}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          m: 1.5,
        }}
      >
        <Button
          data-testid="background-effect-cancel-button"
          variant="outlined"
          color="primary"
          sx={{ width: '100%', mr: 1 }}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          data-testid="background-effect-apply-button"
          variant="contained"
          color="primary"
          sx={{ width: '100%' }}
          onClick={handleApplyBackgroundSelect}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
};

export default BackgroundEffectsLayout;
