import React from 'react';
import { Paper } from '@mui/material';

interface SelectableOptionProps {
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  image?: string;
  size?: number;
}

const SelectableOption: React.FC<SelectableOptionProps> = ({
  selected,
  onClick,
  icon,
  image,
  size = 68,
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
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.1s ease-in-out',
        backgroundColor: '#fff',
      }}
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
