import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import QrPlaceholder from '../../../components/QrPlaceholder';
import RoleBadge from '../../../components/RoleBadge';
import type { MeetingRole } from '../../../types/MeetingRole';
import useDraftLinks from '../../hooks/useDraftLinks';
import LinkCopyField from './components/LinkCopyField';
import ShareImageButton from './components/ShareImageButton';
import ShareMeetingHeader from './components/ShareMeetingHeader';

/**
 * Share variant A: one row per role with its link; the QR code unfolds inside the row on demand.
 */
const ShareLinkList = ({ initialQrRole }: { initialQrRole: MeetingRole | null }): ReactElement => {
  const { t } = useTranslation();
  const links = useDraftLinks();
  const [qrRole, setQrRole] = useState(initialQrRole);

  return (
    <div className="flex flex-col gap-5">
      <ShareMeetingHeader />
      <ul className="flex flex-col gap-3">
        {links.map(({ role, url }) => {
          const isQrOpen = qrRole === role;

          return (
            <li
              key={role}
              className="flex flex-col gap-3 rounded-vera-large border border-vera-border p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <RoleBadge meetingRole={role} />
                <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                  {role === 'moderator'
                    ? t('meetingFlow.wizard.share.keepPrivate')
                    : t(`meetingFlow.role.${role}.description`)}
                </span>
              </div>
              <LinkCopyField url={url} />
              <div className="flex flex-wrap gap-2">
                <ShareImageButton />
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setQrRole(isQrOpen ? null : role)}
                  endIcon={
                    <VividIcon
                      name={isQrOpen ? 'chevron-up-line' : 'chevron-down-line'}
                      customSize={-6}
                      style={{ color: 'var(--vera-primary)' }}
                    />
                  }
                >
                  {isQrOpen
                    ? t('meetingFlow.wizard.share.hideQr')
                    : t('meetingFlow.wizard.share.showQr')}
                </Button>
              </div>
              {isQrOpen && (
                <div className="flex items-center gap-4 rounded-vera-medium bg-vera-background p-3">
                  <QrPlaceholder
                    seed={url}
                    label={t('meetingFlow.common.qrPlaceholder', {
                      role: t(`meetingFlow.role.${role}`),
                    })}
                    className="w-28 shrink-0"
                  />
                  <span className="font-vera-plain text-vera-body-base text-vera-text-secondary">
                    {t('meetingFlow.wizard.share.scanHint', {
                      role: t(`meetingFlow.role.${role}`),
                    })}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="font-vera-plain text-vera-caption text-vera-text-tertiary">
        {t('meetingFlow.wizard.share.savedHint')}
      </p>
    </div>
  );
};

export default ShareLinkList;
