import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import VividIcon from '../VividIcon';

export type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
};

const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-vera-medium border border-vera-border bg-vera-background">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={isExpanded}
        onClick={() => {
          setIsExpanded((currentIsExpanded) => !currentIsExpanded);
        }}
      >
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-secondary">
          {title}
        </span>

        <VividIcon
          name={isExpanded ? 'chevron-up-line' : 'chevron-down-line'}
          customSize={-5}
          className="text-vera-tertiary"
        />
      </button>

      {isExpanded ? <div className="border-t border-vera-border px-4 py-4">{children}</div> : null}
    </div>
  );
};

export default CollapsibleSection;
