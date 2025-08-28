import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, useMediaQuery } from '@mui/material';
import BackgroundVideoContainer from '../../../BackgroundEffects/BackgroundVideoContainer';
import usePreviewPublisherContext from '../../../../hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '../../../../hooks/useBackgroundPublisherContext';
import getInitialBackgroundFilter from '../../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import BackgroundEffectTabs, {
  cleanBackgroundReplacementIfSelectedAndDeleted,
} from '../../../BackgroundEffects/BackgroundEffectTabs/BackgroundEffectTabs';

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
 *   @property {Function} handleClose - Function to close the panel.
 * @returns {ReactElement} The background effects panel component.
 */
const BackgroundEffectsLayout = ({
  isOpen,
  handleClose,
}: BackgroundEffectsProps): ReactElement | false => {
  const [tabSelected, setTabSelected] = useState<number>(0);
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

  const customBackgroundImageChange = (dataUrl: string) => {
    setTabSelected(0);
    handleBackgroundSelect(dataUrl);
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
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
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
          {!isTabletViewport && buttonGroup}
        </Box>

        <BackgroundEffectTabs
          tabSelected={tabSelected}
          setTabSelected={setTabSelected}
          backgroundSelected={backgroundSelected}
          setBackgroundSelected={setBackgroundSelected}
          cleanBackgroundReplacementIfSelectedAndDeletedFunction={(dataUrl: string) =>
            cleanBackgroundReplacementIfSelectedAndDeleted(
              publisher,
              changeBackground,
              backgroundSelected,
              dataUrl
            )
          }
          customBackgroundImageChange={customBackgroundImageChange}
        />

        {isTabletViewport && buttonGroup}
      </Box>
    )
  );
};

export default BackgroundEffectsLayout;
