import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

const swatches = [
  { labelKey: 'meetingFlow.meetingTab.legend.scheduled', className: 'bg-vera-primary' },
  { labelKey: 'meetingFlow.meetingTab.legend.extended', className: 'bg-vera-primary/45' },
  {
    labelKey: 'meetingFlow.meetingTab.legend.preview',
    className: 'border-2 border-dashed border-vera-primary bg-vera-primary/15',
  },
  {
    labelKey: 'meetingFlow.meetingTab.legend.available',
    className: 'border border-vera-border bg-vera-background',
  },
];

/**
 * Color key under the extension timeline.
 */
const ExtensionTimelineLegend = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {swatches.map(({ labelKey, className }) => (
        <li
          key={labelKey}
          className="flex items-center gap-2 font-vera-plain text-vera-caption text-vera-text-tertiary"
        >
          <span className={`h-3 w-5 rounded-full ${className}`} />
          {t(labelKey)}
        </li>
      ))}
    </ul>
  );
};

export default ExtensionTimelineLegend;
