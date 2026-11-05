import type { ReactElement, ReactNode } from 'react';

export type SettingsInfoRowProps = {
  label: string;
  value: ReactNode;
  description?: string;
};

/**
 * A read-only settings row laid out like `Field`: label and value on one line, description under it.
 */
const SettingsInfoRow = ({ label, value, description }: SettingsInfoRowProps): ReactElement => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-4">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {label}
        </span>
        <span className="font-vera-plain text-vera-body-base-semibold tabular-nums text-vera-text-secondary">
          {value}
        </span>
      </div>
      {description && (
        <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">{description}</p>
      )}
    </div>
  );
};

export default SettingsInfoRow;
