import CircularProgress from '@mui/material/CircularProgress';
import type { ReactElement } from 'react';

const LoadingIndicator = (): ReactElement => {
  return (
    <CircularProgress className="text-vera-primary" data-testid="list-loading-spinner" size={20} />
  );
};

export default LoadingIndicator;
