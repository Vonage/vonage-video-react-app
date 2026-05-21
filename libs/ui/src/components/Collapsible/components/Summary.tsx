import type { ComponentProps, ReactNode } from 'react';
import collapsible$, { CollapsibleAPI, CollapsibleState } from '../collapsible$';
import { CollapsibleSlots } from '../constants';
import { twMerge } from 'tailwind-merge';
import { isFunction } from '@common/assertions';
import { Prettify } from '@common/types';

type Callback = (state: Prettify<CollapsibleState & CollapsibleAPI['actions']>) => ReactNode;

type SummaryProps = Omit<ComponentProps<'summary'>, 'children'> & {
  children: ReactNode | Callback;
};

/**
 * Summary slot for the Collapsible component.
 *
 * @example
 * <Collapsible>
 *   <Collapsible.Summary>
 *     Summary content here
 *   </Collapsible.Summary>
 *   ...
 *
 * @example
 * <Collapsible>
 *  <Collapsible.Summary>
 *     {({ open }) => open ? 'Collapse' : 'Expand'}
 *  </Collapsible.Summary>
 *  ...
 */
function Summary({ className, children, ...props }: SummaryProps) {
  return (
    <summary
      className={twMerge(
        CollapsibleSlots.Summary,
        'flex items-center cursor-pointer list-none',
        className
      )}
      {...props}
    >
      {isFunction(children) ? (
        <StateRenderer builder={children as Callback} />
      ) : (
        (children as ReactNode)
      )}
    </summary>
  );
}

function StateRenderer({ builder }: { builder: Callback }) {
  const [state, actions] = collapsible$.use();
  return builder({ ...state, ...actions });
}

Summary.displayName = CollapsibleSlots.Summary;

export default Summary;
