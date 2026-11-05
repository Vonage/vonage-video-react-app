import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import extensionViewer$ from '../../../context/extensionViewerContext';
import useMeetingTabCopy from '../../../hooks/useMeetingTabCopy';

/**
 * Who extended the meeting, by how much and when, oldest first.
 */
const ExtensionHistoryList = (): ReactElement => {
  const { t } = useTranslation();
  const history = extensionViewer$.use.select((state) => state.history);
  const { formatTime } = useMeetingTabCopy();

  return (
    <section className="flex flex-col gap-3">
      <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
        {t('meetingFlow.meetingTab.history')}
      </span>
      {history.length === 0 ? (
        <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
          {t('meetingFlow.meetingTab.historyEmpty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {history.map(({ minutes, extendedBy, extendedAt }) => (
            <li
              key={extendedAt.getTime()}
              className="flex items-center gap-3 font-vera-plain text-vera-body-base text-vera-text-secondary"
            >
              <VividIcon
                name="add-time-line"
                customSize={-5}
                style={{ color: 'var(--vera-text-tertiary)', flexShrink: 0 }}
              />
              <span className="flex-1">
                {t('meetingFlow.meetingTab.historyEntry', {
                  count: minutes,
                  name:
                    extendedBy.kind === 'self' ? t('meetingFlow.meetingTab.you') : extendedBy.name,
                })}
              </span>
              <span className="text-vera-caption tabular-nums text-vera-text-tertiary">
                {formatTime(extendedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ExtensionHistoryList;
