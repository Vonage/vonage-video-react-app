import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import QrPlaceholder from '../../../components/QrPlaceholder';
import RoleBadge from '../../../components/RoleBadge';
import useDraftLinks from '../../hooks/useDraftLinks';
import LinkCopyField from './components/LinkCopyField';
import ShareImageButton from './components/ShareImageButton';
import ShareMeetingHeader from './components/ShareMeetingHeader';

/**
 * Share variant C: every role as a ready-to-send invitation card with QR, link and image share side by side.
 */
const ShareInviteCards = (): ReactElement => {
  const { t } = useTranslation();
  const links = useDraftLinks();

  return (
    <div className="flex flex-col gap-5">
      <ShareMeetingHeader />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map(({ role, url }) => {
          const roleName = t(`meetingFlow.role.${role}`);
          const isModerator = role === 'moderator';

          return (
            <li
              key={role}
              className={classNames('flex flex-col gap-3 rounded-vera-large border p-4', {
                'border-vera-primary bg-vera-background': isModerator,
                'border-vera-border bg-vera-surface': !isModerator,
              })}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-2">
                  <RoleBadge meetingRole={role} className="self-start" />
                  <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                    {isModerator
                      ? t('meetingFlow.wizard.share.keepPrivate')
                      : t('meetingFlow.wizard.share.scanHint', { role: roleName })}
                  </span>
                </div>
                <QrPlaceholder
                  seed={url}
                  label={t('meetingFlow.common.qrPlaceholder', { role: roleName })}
                  className="w-20 shrink-0 border border-vera-border"
                />
              </div>
              <LinkCopyField url={url} />
              <ShareImageButton className="self-start" />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ShareInviteCards;
