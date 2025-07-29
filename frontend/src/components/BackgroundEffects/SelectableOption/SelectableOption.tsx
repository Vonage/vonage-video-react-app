import React from 'react';
import { Paper } from '@mui/material';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../utils/constants';

interface SelectableOptionProps {
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  image?: string;
  size?: number;
  isDisabled?: boolean;
}

const SelectableOption: React.FC<SelectableOptionProps> = ({
  selected,
  onClick,
  icon,
  image,
  size = DEFAULT_SELECTABLE_OPTION_WIDTH,
  isDisabled = false,
  ...otherProps // Used by MUI Tooltip
}) => {
  return (
    <Paper
      onClick={onClick}
      elevation={selected ? 4 : 1}
      sx={{
        width: size,
        height: size,
        overflow: 'hidden',
        borderRadius: '16px',
        border: selected ? '2px solid #1976d2' : '',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.1s ease-in-out',
        backgroundColor: isDisabled ? '#f5f5f5' : '#fff',
        opacity: isDisabled ? 0.5 : 1,
      }}
      {...otherProps}
    >
      {image ? (
        <img
          src={image}
          alt="background"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        icon
      )}
    </Paper>
  );
};

export default SelectableOption;
