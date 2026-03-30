import type { ReactElement } from 'react';

import VividIcon from '@ui/VividIcon';

import type { ListErrorStateProps } from '../List.types';

const ListErrorState = ({ errorMessage }: ListErrorStateProps): ReactElement => {
  return (
    <div className="flex items-center gap-1">
      <VividIcon className="text-vera-warning" customSize={-4} name="warning-line" />
      <p className="ml-1 text-vera-heading-4 text-vera-text-tertiary">{errorMessage}</p>
    </div>
  );
};

export default ListErrorState;
