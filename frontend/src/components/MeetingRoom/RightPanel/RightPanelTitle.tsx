import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { ReactElement } from 'react';

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
    <div
      style={{ width: 'inherit' }}
      className="flex h-[64px] flex-row items-center justify-between pl-6"
    >
      <span className="text-darkGray text-lg font-normal tracking-normal">{title}</span>
      <IconButton onClick={handleClose} size="large" sx={{ color: 'rgb(95, 99, 104)' }}>
        <Close />
      </IconButton>
    </div>
  );
};

export default RightPanelTitle;
