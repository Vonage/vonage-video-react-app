import type { ComponentProps } from 'react';
import { CollapsibleSlots } from '../constants';
import classNames from 'classnames';

/**
 * Details slot for the Collapsible component.
 *
 * @example
 * <Collapsible>
 *   ...
 *   <Collapsible.Details>
 *     Details content here
 *   </Collapsible.Details>
 * </Collapsible>
 */
function Details({ className, children, ...restProps }: ComponentProps<'div'>) {
  return (
    <div className={classNames(CollapsibleSlots.Details, className)} {...restProps}>
      {children}
    </div>
  );
}

Details.displayName = CollapsibleSlots.Details;

export default Details;
