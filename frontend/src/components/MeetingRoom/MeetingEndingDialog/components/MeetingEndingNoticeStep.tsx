import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export type MeetingEndingNoticeStepProps = {
  isAtLimit: boolean;
  onGotIt: () => void;
  onExtend: () => void;
};

const MeetingEndingNoticeStep = ({
  isAtLimit,
  onGotIt,
  onExtend,
}: MeetingEndingNoticeStepProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <h2
        id="meeting-ending-dialog-title"
        className="px-6 py-4 text-vera-heading-4 text-vera-text-secondary"
      >
        {t('meetingExtension.endingTitle')}
      </h2>
      <div className="px-6 pb-5">
        <p className="text-vera-body-base text-vera-text-tertiary">
          {t('meetingExtension.endingBody')}
          {isAtLimit && ` ${t('meetingExtension.cannotExtend')}`}
        </p>
      </div>
      <div className="flex justify-end gap-2 p-2">
        <button
          type="button"
          className="cursor-pointer rounded-vera-small px-2 py-1.5 text-vera-body-base-semibold text-vera-primary hover:bg-vera-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vera-primary"
          onClick={onGotIt}
        >
          {t('meetingExtension.gotIt')}
        </button>
        {!isAtLimit && (
          <button
            type="button"
            className="cursor-pointer rounded-vera-small bg-vera-primary px-4 py-1.5 text-vera-body-base-semibold text-vera-on-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vera-primary"
            onClick={onExtend}
          >
            {t('meetingExtension.extend')}
          </button>
        )}
      </div>
    </>
  );
};

export default MeetingEndingNoticeStep;
