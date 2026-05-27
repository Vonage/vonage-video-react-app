import { useEffect, type ComponentProps, type PropsWithChildren } from 'react';
import findSlotByDisplayName from '@ui/helpers/findSlotByDisplayName';
import { twMerge } from 'tailwind-merge';
import collapsible$, { CollapsibleState } from './collapsible$';
import { CollapsibleSlots } from './constants';
import { Summary, Details } from './components';
import { useStableCallback } from '@web/hooks';
import Icon from './components/Icon';

export type CollapsibleProps = {
  children: React.ReactNode[];
} & PropsWithChildren<Omit<ComponentProps<'details'>, 'children'>>;

const InnerCollapsible = ({ children, className, onToggle, ...props }: CollapsibleProps) => {
  const summary = findSlotByDisplayName({
    children,
    displayName: CollapsibleSlots.Summary,
  });

  const details = findSlotByDisplayName({
    children,
    displayName: CollapsibleSlots.Details,
  });

  const remainingChildren = children.filter?.((child) => ![summary, details].includes(child));

  const {
    setState,
    actions: { toggle },
  } = collapsible$.use.api();

  const open = collapsible$.use.select((state) => state.open);

  useEffect(
    function syncOpenState() {
      setState((state) => ({
        ...state,
        open: props.open ?? state.open,
      }));
    },
    [setState, props.open]
  );

  return (
    <details
      {...props}
      open={open}
      onToggle={(event) => {
        toggle({ open: event.currentTarget.open });
        onToggle?.(event);
      }}
      className={twMerge('Collapsible flex flex-col open:gap-3', className)}
    >
      {summary}
      {details}
      {remainingChildren}
    </details>
  );
};

/**
 * Collapsible component that can be used to show/hide content.
 *
 * @example
 * <Collapsible>
 *   <Collapsible.Summary>
 *     Click to expand
 *   </Collapsible.Summary>
 *
 *   <Collapsible.Details>
 *     This is the content that can be collapsed.
 *   </Collapsible.Details>
 * </Collapsible>
 */
const Collapsible = (props: CollapsibleProps) => {
  const initialize = useStableCallback((state: CollapsibleState) => {
    return {
      ...state,
      open: props.open ?? state.open,
    };
  });

  return (
    <collapsible$.Provider value={initialize}>
      <InnerCollapsible {...props} />
    </collapsible$.Provider>
  );
};

/**
 * Summary slot for the Collapsible component.
 */
Collapsible.Summary = Summary;

/**
 * Details slot for the Collapsible component.
 */
Collapsible.Details = Details;

/**
 * Icon component for the Collapsible summary
 */
Collapsible.Icon = Icon;

export default Collapsible;
