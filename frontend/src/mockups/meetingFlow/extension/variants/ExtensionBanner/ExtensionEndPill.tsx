import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@ui/components/VividIcon';
import meetingExtension$ from '../../context/meetingExtensionContext';
import useExtensionCopy from '../../hooks/useExtensionCopy';
import TimeRoomLabel from '../../components/TimeRoomLabel';

/**
 * Entry point of variant B at any time: the end time next to the room name, with a plus to extend.
 */
const ExtensionEndPill = (): ReactElement => {
  const { t } = useTranslation();
  const { endsAtLabel, isAtCap, atCapLabel } = useExtensionCopy();
  const { setOpen } = meetingExtension$.use.actions();

  return (
    <>
      <TimeRoomLabel />
      <Tooltip title={isAtCap ? atCapLabel : t('meetingFlow.extension.extendMeeting')}>
        <span>
          <button
            type="button"
            disabled={isAtCap}
            onClick={() => setOpen(true)}
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-vera-dark-grey px-3 font-vera-plain text-vera-caption-semibold text-vera-on-dark-grey transition-colors hover:bg-vera-dark-grey-hover disabled:cursor-not-allowed"
          >
            {t('meetingFlow.extension.endsAtShort', { time: endsAtLabel })}
            <VividIcon
              name={isAtCap ? 'lock-line' : 'add-time-line'}
              customSize={-6}
              style={{ color: 'var(--vera-on-dark-grey)' }}
            />
          </button>
        </span>
      </Tooltip>
    </>
  );
};

export default ExtensionEndPill;
