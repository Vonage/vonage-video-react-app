import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, Tab, Tabs } from '@mui/material';
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

/**
 * BackgroundEffectsLayout Component
 *
 * This component manages the UI for background effects (cancel background and blurs) in a room.
 * @param {BackgroundEffectsLayoutProps} props - The props for the component.
 *   @property {boolean} isOpen - Whether the background effects panel is open.
 *   @property {Function} handleClose - Function to close the panel.
 * @returns {ReactElement} The background effects panel component.
 */
const BackgroundEffectsLayout = ({
  handleClose,
  isOpen,
}: BackgroundEffectsLayoutProps): ReactElement | false => {
  const [tabSelected, setTabSelected] = useState<number>(1);
  const [backgroundSelected, setBackgroundSelected] = useState<string>('none');
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

  // Reset background when closing the panel
  useEffect(() => {
    if (isOpen) {
      const currentOption = setInitialBackgroundReplacement();
      changeBackgroundPreview(currentOption);
    }
  }, [publisherVideoFilter, isOpen, changeBackgroundPreview, setInitialBackgroundReplacement]);

  return (
    isOpen && (
      <>
        <RightPanelTitle title="Background Effects" handleClose={handleClose} />

        <Box sx={{ ml: 1.5, mr: 1.5 }}>
          <BackgroundVideoContainer
            publisherVideoElement={publisherVideoElement}
            isParentVideoEnabled={isVideoEnabled}
          />
        </Box>

        <Box display="flex" justifyContent="center">
          <Tabs
            variant="fullWidth"
            style={{ padding: '4px 12px', width: '100%' }}
            value={tabSelected}
            onChange={(_event, newValue) => setTabSelected(newValue)}
            aria-label="backgrounds tabs"
          >
            <Tab sx={{ textTransform: 'none' }} label="Backgrounds" />
            <Tab sx={{ textTransform: 'none' }} label="Add Background" />
          </Tabs>
        </Box>
        <Box className="choose-background-effect-box" sx={{ m: 1.5 }}>
          {tabSelected === 0 && (
            <Box
              display="grid"
              gridTemplateColumns={`repeat(auto-fill, minmax(${DEFAULT_SELECTABLE_OPTION_WIDTH}px, 1fr))`}
              gap={1}
              sx={{
                overflowY: 'auto',
                maxHeight: '400px',
              }}
            >
              <EffectOptionButtons
                backgroundSelected={backgroundSelected}
                setBackgroundSelected={handleBackgroundSelect}
              />
              {/* TODO: load custom images */}
              <BackgroundGallery
                backgroundSelected={backgroundSelected}
                setBackgroundSelected={handleBackgroundSelect}
              />
            </Box>
          )}
          {tabSelected === 1 && <AddBackgroundEffectLayout />}
        </Box>

        <Box display="flex" justifyContent="space-between" m={1.5}>
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
      </>
    )
  );
};

export default BackgroundEffectsLayout;
