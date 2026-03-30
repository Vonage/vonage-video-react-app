import type { ReactElement } from 'react';

import Separator from '@ui/Separator';
import VividIcon from '@ui/VividIcon';

import type { ListEmptyStateProps } from '../List.types';

const ListEmptyState = ({ emptyMessage }: ListEmptyStateProps): ReactElement => {
  return (
    <>
      <div className="mb-4 flex flex-row items-center gap-1.5" data-testid="list-empty-state">
        <VividIcon className="text-vera-secondary" customSize={-4} name="video-active-line" />
        <p className="ml-2 text-vera-body-extended text-vera-text-secondary">{emptyMessage}</p>
      </div>

      <Separator width="100%" />
    </>
  );
};

export default ListEmptyState;
