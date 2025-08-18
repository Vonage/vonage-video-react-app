import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, Tab, Tabs, useMediaQuery } from '@mui/material';
import usePublisherContext from '../../../hooks/usePublisherContext';
import RightPanelTitle from '../RightPanel/RightPanelTitle';
import EffectOptionButtons from '../../BackgroundEffects/EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../../BackgroundEffects/BackgroundGallery/BackgroundGallery';
import BackgroundVideoContainer from '../../BackgroundEffects/BackgroundVideoContainer';
import useBackgroundPublisherContext from '../../../hooks/useBackgroundPublisherContext';
import getInitialBackgroundFilter from '../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import AddBackgroundEffectLayout from '../../BackgroundEffects/AddBackgroundEffect/AddBackgroundEffectLayout/AddBackgroundEffectLayout';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../utils/constants';

export type BackgroundEffectsLayoutProps = {
  handleClose: () => void;
  isOpen: boolean;
};

/**
 * BackgroundEffectsLayout Component
 *
 * This component manages the UI for background effects in the waiting room.
 * @param {BackgroundEffectsLayoutProps} props - The props for the component.
 *   @property {boolean} isOpen - Whether the background effects panel is open.
 *   @property {Function} handleClose - Function to close the panel.
 * @returns {ReactElement} The background effects panel component.
 */
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

  const customBackgroundImageChange = (dataUrl: string) => {
    setTabSelected(0);
    setBackgroundSelected(dataUrl);
  };

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

      <Box flex={1} minWidth={0} flexDirection={{ xs: 'column' }} justifyContent="center">
        <Tabs
          variant="fullWidth"
          sx={{
            padding: '0 2px 12px 2px',
            '& .MuiTabs-flexContainer': {
              borderBottom: '1px solid #ccc',
            },
          }}
          value={tabSelected}
          onChange={(_event, newValue) => setTabSelected(newValue)}
          aria-label="backgrounds tabs"
        >
          <Tab sx={{ textTransform: 'none' }} label="Backgrounds" />
          <Tab sx={{ textTransform: 'none' }} label="Add Background" />
        </Tabs>
        <Box className="choose-background-effect-box" flex={1} minWidth={0}>
          {tabSelected === 0 && (
            <Box
              display="grid"
              gridTemplateColumns={`repeat(auto-fill, minmax(${DEFAULT_SELECTABLE_OPTION_WIDTH}px, 1fr))`}
              gap={1}
              sx={{
                overflowY: 'auto',
                maxHeight: '375px',
                padding: '8px',
              }}
            >
              <EffectOptionButtons
                backgroundSelected={backgroundSelected}
                setBackgroundSelected={handleBackgroundSelect}
              />
              <BackgroundGallery
                backgroundSelected={backgroundSelected}
                setBackgroundSelected={handleBackgroundSelect}
              />
            </Box>
          )}
          {tabSelected === 1 && (
            <AddBackgroundEffectLayout customBackgroundImageChange={customBackgroundImageChange} />
          )}
        </Box>
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
