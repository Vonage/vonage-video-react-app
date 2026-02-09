import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import EffectOptionButtons from '../EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../BackgroundGallery/BackgroundGallery';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '@utils/constants';

type BackgroundEffectOptionsProps = {
  mode: 'meeting' | 'waiting';
};

/**
 * BackgroundEffectOptions Component
 *
 * This component manages the tabs for background effects, including selecting existing backgrounds
 * and adding new ones.
 * @param {BackgroundEffectOptionsProps} props - The props for the component.
 *   @property {string} mode - The mode of the background effect ('meeting' or 'waiting').
 * @returns {ReactElement} The background effect tabs component.
 */
const BackgroundEffectOptions = ({ mode }: BackgroundEffectOptionsProps): ReactElement => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'block',
        flex: 1,
        minWidth: 0,
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        minHeight: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          maxHeight: '100%',
          overflow: 'hidden',
          borderRadius: theme.shapes.borderRadiusLarge,
          backgroundColor: theme.colors.surface,
          justifyContent: 'center',
          flex: 1,
          minWidth: 0,
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns={`repeat(auto-fill, minmax(${DEFAULT_SELECTABLE_OPTION_WIDTH}px, 1fr))`}
          gap={0.5}
          className={
            mode === 'meeting'
              ? 'choose-background-effect-grid'
              : 'choose-background-effect-grid-waiting'
          }
        >
          <EffectOptionButtons />
          <BackgroundGallery />
        </Box>
      </Box>
    </Box>
  );
};

export default BackgroundEffectOptions;
