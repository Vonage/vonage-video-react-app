import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Popper, { type PopperPlacementType } from '@mui/material/Popper';
import VividIcon from '@ui/components/VividIcon';
import { isNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import { getFormattedTime } from '@utils/dateTime';
import ExtendOptionRow from './components/ExtendOptionRow';
import useExtendMeeting from './hooks/useExtendMeeting';
import type { MeetingExtension } from './hooks/useMeetingExtension';

export type ExtendPopoverProps = {
  anchorElement: HTMLElement | null;
  placement: PopperPlacementType;
  scheduleWindow: ScheduleWindow;
  extension: MeetingExtension;
  onClose: () => void;
};

const popperModifiers = [{ name: 'offset', options: { offset: [0, 12] } }];

/**
 * Popover on the meeting timer that lists the extension options, each with the end time it leads to.
 */
const ExtendPopover = ({
  anchorElement,
  placement,
  scheduleWindow,
  extension,
  onClose,
}: ExtendPopoverProps): ReactElement => {
  const { t, i18n } = useTranslation();
  const extendMeeting = useExtendMeeting();
  const [selectedMinutes, setSelectedMinutes] = useState(
    () => extension.options.find(({ isAvailable }) => isAvailable)?.minutes ?? null
  );
  const [isExtending, setIsExtending] = useState(false);
  const hasExtensions = extension.extendedMinutes > 0;

  const handleExtend = async () => {
    if (isNil(selectedMinutes)) return;

    setIsExtending(true);
    await extendMeeting(selectedMinutes);
    setIsExtending(false);
  };

  return (
    <Popper
      open
      role="presentation"
      disablePortal
      anchorEl={anchorElement}
      placement={placement}
      modifiers={popperModifiers}
      className="z-10"
    >
      <div
        role="dialog"
        aria-label={t('meetingExtension.title')}
        className="flex w-80 max-w-[calc(100dvw-2rem)] flex-col gap-4 rounded-vera-large border border-vera-border bg-vera-surface p-4 shadow-md"
      >
        <div className="flex flex-col">
          <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
            {t('meetingExtension.title')}
          </span>
          <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
            {t('meetingExtension.endsAt', {
              time: getFormattedTime(i18n.language, scheduleWindow.endsAt),
            })}
          </span>
        </div>
        {extension.isAtLimit ? (
          <div
            role="note"
            className="flex items-start gap-3 rounded-vera-medium border border-vera-information bg-vera-information/10 px-4 py-3 font-vera-plain text-vera-body-base text-vera-information"
          >
            <VividIcon
              name="info-line"
              customSize={-5}
              style={{ color: 'var(--vera-information)', flexShrink: 0 }}
            />
            <p className="flex-1">
              {t('meetingExtension.atLimit', { minutes: extension.maxTotalMinutes })}
            </p>
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-label={t('meetingExtension.title')}
            className="flex flex-col gap-1"
          >
            {extension.options.map((option) => (
              <ExtendOptionRow
                key={option.minutes}
                option={option}
                isSelected={option.minutes === selectedMinutes}
                endsAt={scheduleWindow.endsAt}
                maxTotalMinutes={extension.maxTotalMinutes}
                onSelect={setSelectedMinutes}
              />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
            {hasExtensions &&
              t('meetingExtension.used', {
                used: extension.extendedMinutes,
                max: extension.maxTotalMinutes,
              })}
          </span>
          <div className="flex shrink-0 gap-2">
            <Button variant="text" size="small" className="whitespace-nowrap" onClick={onClose}>
              {t('meetingExtension.notNow')}
            </Button>
            {!extension.isAtLimit && (
              <Button
                variant="contained"
                size="small"
                disabled={isNil(selectedMinutes) || isExtending}
                className="disabled:bg-vera-disabled! disabled:text-vera-text-disabled! disabled:border-vera-disabled!"
                onClick={() => void handleExtend()}
              >
                {t('meetingExtension.extend')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Popper>
  );
};

export default ExtendPopover;
