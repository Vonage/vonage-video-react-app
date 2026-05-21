import VividIcon, { VividIconProps } from '@ui/VividIcon';
import collapsible$ from '../collapsible$';

type IconProps = Omit<VividIconProps, 'name'>;

/**
 * Default icon for the Collapsible component that indicates whether the content is expanded or collapsed.
 *
 * @example
 * <Collapsible>
 *   ...
 *   <Collapsible.Summary>
 *     Summary content here
 *     <Collapsible.Icon />
 *   </Collapsible.Summary>
 * </Collapsible>
 */
const Icon = (props: IconProps) => {
  const open = collapsible$.use.select(({ open }) => open);
  return (
    <VividIcon
      // Class name is for facilitating testing and debugging, not for styling. --- IGNORE ---
      className={'Collapsible.Icon' as never}
      name={open ? 'chevron-up-line' : 'chevron-down-line'}
      {...props}
    />
  );
};

Icon.displayName = `Collapsible.Icon`;

export default Icon;
