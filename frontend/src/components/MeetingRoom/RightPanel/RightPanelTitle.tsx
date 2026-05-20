import IconButton from '@mui/material/IconButton';
import { ReactElement } from 'react';
import VividIcon from '@ui/VividIcon';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type RightPanelTitleProps = {
  handleClose: () => void;
  title: string;
};

/**
 * RightPanelTitle component
 * Renders the title for the RightPanel component with a text title and an X icon to close the panel
 * @param {RightPanelTitleProps} props - the Props
 *  @property {() => void} handleClose - click handler for X icon
 *  @property {string} title - Title to display
 *  }
 * @returns {ReactElement} - RightPanelTitle component
 */
const RightPanelTitle = ({ handleClose, title }: RightPanelTitleProps): ReactElement => {
  return (
    <Box
      data-testid="right-panel-title"
      sx={{
        width: 'inherit',
        display: 'flex',
        height: '64px',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        pl: 3,
        pr: 0.5,
      }}
    >
      <Typography variant="body1" className="text-vera-text-tertiary">
        {title}
      </Typography>
      <IconButton
        onClick={handleClose}
        size="large"
        className="text-vera-secondary!"
        data-testid="CloseIcon"
      >
        <VividIcon name="close-line" customSize={-5} />
      </IconButton>
    </Box>
  );
};

export default RightPanelTitle;
