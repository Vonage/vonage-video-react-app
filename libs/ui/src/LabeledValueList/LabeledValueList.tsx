import type { ReactElement } from 'react';

export type LabeledValueItem = {
  label: string;
  value: string;
};

export type LabeledValueListProps = {
  title: string;
  items: LabeledValueItem[];
};

const LabeledValueList = ({ title, items }: LabeledValueListProps): ReactElement => {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="font-vera-plain text-vera-body-extended-semibold text-vera-secondary">
        {title}
      </h4>

      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-2 border-b border-vera-border py-1"
          >
            <span className="font-vera-plain text-vera-body-base text-vera-tertiary">
              {item.label}
            </span>
            <span className="font-vera-plain text-vera-body-base text-vera-secondary">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LabeledValueList;
