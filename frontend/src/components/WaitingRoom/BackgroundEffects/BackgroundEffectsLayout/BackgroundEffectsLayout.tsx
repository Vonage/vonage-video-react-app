import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import EffectOptionButtons from '../../../BackgroundEffects/EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../../../BackgroundEffects/BackgroundGallery/BackgroundGallery';
import BackgroundVideoContainer from '../../../BackgroundEffects/BackgroundVideoContainer';
import usePreviewPublisherContext from '../../../../hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '../../../../hooks/useBackgroundPublisherContext';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../../utils/constants';
import getInitialBackgroundFilter from '../../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import AddBackgroundEffectLayout from '../../../BackgroundEffects/AddBackgroundEffect/AddBackgroundEffectLayout/AddBackgroundEffectLayout';

export type BackgroundEffectsProps = {
  isOpen: boolean;
  handleClose: () => void;
};

/**
 * BackgroundEffectsLayout Component
 *
 * This component manages the UI for background effects in the waiting room.
 * @param {BackgroundEffectsProps} props - The props for the component.
 *   @property {boolean} isOpen - Whether the background effects panel is open.
 * @returns {ReactElement} The background effects panel component.
 */
const BackgroundEffectsLayout = ({
  isOpen,
  handleClose,
}: BackgroundEffectsProps): ReactElement | false => {
  const [tabSelected, setTabSelected] = useState<number>(1);
  const [backgroundSelected, setBackgroundSelected] = useState<string>('none');
  const { publisher, changeBackground, isVideoEnabled } = usePreviewPublisherContext();
  const { publisherVideoElement, changeBackground: changeBackgroundPreview } =
    useBackgroundPublisherContext();
  const isTabletViewport = useMediaQuery(`(max-width:899px)`);

  const handleBackgroundSelect = (selectedBackgroundOption: string) => {
    setBackgroundSelected(selectedBackgroundOption);
    changeBackgroundPreview(selectedBackgroundOption);
  };

  const handleApplyBackgroundSelect = () => {
    changeBackground(backgroundSelected);
    handleClose();
  };

  const setInitialBackgroundReplacement = useCallback(() => {
    const selectedBackgroundOption = getInitialBackgroundFilter(publisher);
    setBackgroundSelected(selectedBackgroundOption);
    return selectedBackgroundOption;
  }, [publisher, setBackgroundSelected]);

  // Reset background when closing the panel
  useEffect(() => {
    if (isOpen) {
      const currentOption = setInitialBackgroundReplacement();
      changeBackgroundPreview(currentOption);
    }
  }, [publisher, isOpen, changeBackgroundPreview, setInitialBackgroundReplacement]);

  const buttonGroup = (
    <Box display="flex" justifyContent="space-between" mt={1.5}>
      <Button
        variant="outlined"
        color="primary"
        sx={{ width: '100%', mr: 1 }}
        onClick={() => {
          const currentOption = setInitialBackgroundReplacement();
          changeBackgroundPreview(currentOption);
          handleClose();
        }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{ width: '100%' }}
        onClick={handleApplyBackgroundSelect}
      >
        Apply
      </Button>
    </Box>
  );

  return (
    isOpen && (
      <>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Background Effects
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1} minWidth={0}>
            <BackgroundVideoContainer
              publisherVideoElement={publisherVideoElement}
              isParentVideoEnabled={isVideoEnabled}
              isFixedWidth
            />
            {!isTabletViewport && buttonGroup}
          </Box>

          <Box flex={1} minWidth={0} flexDirection={{ xs: 'column' }} justifyContent="center">
            <Tabs
              variant="fullWidth"
              style={{ padding: '0 12px 12px 12px' }}
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
          </Box>

          {isTabletViewport && buttonGroup}
        </Box>
      </>
    )
  );
};

export default BackgroundEffectsLayout;
