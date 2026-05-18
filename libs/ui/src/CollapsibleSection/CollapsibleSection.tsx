import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import VividIcon from '../VividIcon';

export type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
};

/**
 * CollapsibleSection Component
 *
 * Displays a section that can be expanded or collapsed by the user. The section header contains a title and an icon indicating whether the section is expanded or collapsed. The content of the section is displayed when it is expanded and hidden when it is collapsed.
 * @param {CollapsibleSectionProps} props - the props for the component
 *  @property {string} title - the title of the section
 *  @property {ReactNode} children - the content of the section
 *  @property {boolean} defaultExpanded - whether the section is expanded by default (optional, defaults to false)
 * @returns {ReactElement} - The CollapsibleSection component.
 */
const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <details
      className="rounded-vera-medium border border-vera-border bg-vera-background"
      open={isExpanded}
      onToggle={(event) => {
        setIsExpanded(event.currentTarget.open);
      }}
    >
      <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-secondary">
          {title}
        </span>

        <VividIcon
          name={isExpanded ? 'chevron-up-line' : 'chevron-down-line'}
          customSize={-5}
          style={{ color: 'var(--vera-text-tertiary)' }}
        />
      </summary>

      <div className="border-t border-vera-border px-4 py-4">{children}</div>
    </details>
  );
};

export default CollapsibleSection;
