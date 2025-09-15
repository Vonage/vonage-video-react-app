import { Box, Tabs, Tab } from '@mui/material';
import { Publisher } from '@vonage/client-sdk-video';
import EffectOptionButtons from '../EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../BackgroundGallery/BackgroundGallery';
import AddBackgroundEffectLayout from '../AddBackgroundEffect/AddBackgroundEffectLayout/AddBackgroundEffectLayout';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../utils/constants';
import getInitialBackgroundFilter from '../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';

type BackgroundEffectTabsProps = {
  tabSelected: number;
  setTabSelected: (value: number) => void;
  backgroundSelected: string;
  setBackgroundSelected: (value: string) => void;
  cleanBackgroundReplacementIfSelectedAndDeletedFunction: (dataUrl: string) => void;
  customBackgroundImageChange: (dataUrl: string) => void;
};

export const cleanBackgroundReplacementIfSelectedAndDeleted = (
  publisher: Publisher | null | undefined,
  changeBackground: (bg: string) => void,
  backgroundSelected: string,
  dataUrl: string
) => {
  const selectedBackgroundOption = getInitialBackgroundFilter(publisher);
  if (dataUrl === selectedBackgroundOption) {
    changeBackground(backgroundSelected);
  }
};

/**
 * BackgroundEffectTabs Component
 *
 * This component manages the tabs for background effects, including selecting existing backgrounds
 * and adding new ones.
 * @param {BackgroundEffectTabsProps} props - The props for the component.
 *   @property {number} tabSelected - The currently selected tab index.
 *   @property {Function} setTabSelected - Function to set the selected tab index.
 *   @property {string} backgroundSelected - The currently selected background option.
 *   @property {Function} setBackgroundSelected - Function to set the selected background option.
 *   @property {Function} cleanBackgroundReplacementIfSelectedAndDeletedFunction - Function to clean up background replacement if deleted.
 *   @property {Function} customBackgroundImageChange - Callback function to handle background image change.
 * @returns {ReactElement} The background effect tabs component.
 */
const BackgroundEffectTabs = ({
  tabSelected,
  setTabSelected,
  backgroundSelected,
  setBackgroundSelected,
  cleanBackgroundReplacementIfSelectedAndDeletedFunction,
  customBackgroundImageChange,
}: BackgroundEffectTabsProps) => {
  const handleBackgroundSelect = (value: string) => {
    setBackgroundSelected(value);
  };

  return (
    <Box flex={1} minWidth={0} flexDirection={{ xs: 'column' }} justifyContent="center">
      <Tabs
        variant="fullWidth"
        sx={{
          padding: '0 6px 12px 6px',
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
            gap={0.5}
            className="choose-background-effect-grid"
          >
            <EffectOptionButtons
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
            />
            <BackgroundGallery
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
              cleanPublisherBackgroundReplacementIfSelectedAndDeleted={
                cleanBackgroundReplacementIfSelectedAndDeletedFunction
              }
            />
          </Box>
        )}
        {tabSelected === 1 && (
          <AddBackgroundEffectLayout customBackgroundImageChange={customBackgroundImageChange} />
        )}
      </Box>
    </Box>
  );
};

export default BackgroundEffectTabs;
