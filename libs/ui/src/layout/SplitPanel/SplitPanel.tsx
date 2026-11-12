import { Children, type ComponentProps, type ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';
import findSlotByDisplayName from '../../helpers/findSlotByDisplayName';
import SplitPanelLeft from './SplitPanelLeft';
import SplitPanelRight from './SplitPanelRight';

const SplitPanel = ({ children, className, ...props }: ComponentProps<'div'>): ReactElement => {
  const slots = Children.toArray(children);
  const left = findSlotByDisplayName({ children: slots, displayName: SplitPanelLeft.displayName });
  const right = findSlotByDisplayName({
    children: slots,
    displayName: SplitPanelRight.displayName,
  });

  return (
    <div className={twMerge('flex w-full gap-4', className)} {...props}>
      <div className="flex min-w-0 flex-1 flex-col gap-1 break-words">{left}</div>
      <span aria-hidden="true" className="w-px shrink-0 self-stretch bg-vera-border" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 break-words">{right}</div>
    </div>
  );
};

SplitPanel.Left = SplitPanelLeft;
SplitPanel.Right = SplitPanelRight;

export default SplitPanel;
