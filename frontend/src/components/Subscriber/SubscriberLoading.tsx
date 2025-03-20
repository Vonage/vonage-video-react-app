import { CircularProgress } from '@mui/material';
import { ReactElement } from 'react';

const SubscriberLoading = (): ReactElement => {
  return (
    <div
      className="absolute flex"
      style={{
        zIndex: '0',
      }}
    >
      <CircularProgress
        sx={{
          position: 'relative',
        }}
      />
    </div>
  );
};

export default SubscriberLoading;
