import type { ComponentProps, ReactElement } from 'react';
import { tv } from 'tailwind-variants';
import VividIcon from '@ui/components/VividIcon';

type NoticeTone = 'warning' | 'information';

export type NoticeProps = ComponentProps<'div'> & {
  tone: NoticeTone;
};

const notice = tv(
  {
    base: 'flex items-start gap-3 rounded-vera-medium border px-4 py-3 font-vera-plain text-vera-body-base',
    variants: {
      tone: {
        warning: 'border-vera-warning bg-vera-warning/10 text-vera-warning',
        information: 'border-vera-information bg-vera-information/10 text-vera-information',
      },
    },
  },
  { twMerge: false }
);

const toneIcon: Record<NoticeTone, string> = {
  warning: 'warning-line',
  information: 'info-line',
};

/**
 * Inline notice using the same treatment as the Advanced settings warnings.
 */
const Notice = ({ tone, className, children, ...props }: NoticeProps): ReactElement => {
  return (
    <div role="note" className={notice({ tone, className })} {...props}>
      <VividIcon
        name={toneIcon[tone]}
        customSize={-5}
        style={{ color: `var(--vera-${tone})`, flexShrink: 0 }}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Notice;
