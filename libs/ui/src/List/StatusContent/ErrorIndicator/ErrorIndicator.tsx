import Tooltip from '@mui/material/Tooltip';
import type { ReactElement } from 'react';

import VividIcon from '@ui/VividIcon';

import type { ErrorIndicatorProps } from '../../List.types';

const ErrorIndicator = ({ errorTooltip }: ErrorIndicatorProps): ReactElement => {
  return (
    <Tooltip title={errorTooltip}>
      <span className="flex">
        <VividIcon
          className="text-vera-warning"
          customSize={-6}
          data-testid="list-error-icon"
          name="warning-line"
        />
      </span>
    </Tooltip>
  );
};

export default ErrorIndicator;
