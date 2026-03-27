import CircularProgress from '@mui/material/CircularProgress';
import type { ReactElement } from 'react';

const ArchiveLoadingIndicator = (): ReactElement => {
  return (
    <CircularProgress
      className="text-vera-primary"
      data-testid="archive-loading-spinner"
      size={20}
    />
  );
};

export default ArchiveLoadingIndicator;
