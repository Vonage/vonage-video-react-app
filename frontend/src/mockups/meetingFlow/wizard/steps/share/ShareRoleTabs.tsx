import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import QrPlaceholder from '../../../components/QrPlaceholder';
import SegmentedTab from '../../../components/SegmentedTab';
import type { MeetingRole } from '../../../types/MeetingRole';
import useDraftLinks from '../../hooks/useDraftLinks';
import LinkCopyField from './components/LinkCopyField';
import ShareImageButton from './components/ShareImageButton';
import ShareMeetingHeader from './components/ShareMeetingHeader';

/**
 * Share variant B: one role at a time behind tabs, with a large QR code ready to be scanned from the screen.
 */
const ShareRoleTabs = ({ initialRole }: { initialRole: MeetingRole }): ReactElement => {
  const { t } = useTranslation();
  const links = useDraftLinks();
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const selectedLink = links.find(({ role }) => role === selectedRole) ?? links[0];
  const roleName = t(`meetingFlow.role.${selectedLink.role}`);

  return (
    <div className="flex flex-col gap-5">
      <ShareMeetingHeader />
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-2xl bg-vera-background p-1">
        {links.map(({ role }) => (
          <SegmentedTab
            key={role}
            isSelected={role === selectedLink.role}
            onClick={() => setSelectedRole(role)}
          >
            {t(`meetingFlow.role.${role}`)}
          </SegmentedTab>
        ))}
      </div>
      <div role="tabpanel" className="flex flex-col items-center gap-4">
        <QrPlaceholder
          seed={selectedLink.url}
          label={t('meetingFlow.common.qrPlaceholder', { role: roleName })}
          className="w-48 border border-vera-border"
        />
        <span className="text-center font-vera-plain text-vera-body-base text-vera-text-secondary">
          {selectedLink.role === 'moderator'
            ? t('meetingFlow.wizard.share.keepPrivate')
            : t('meetingFlow.wizard.share.scanHint', { role: roleName })}
        </span>
        <LinkCopyField url={selectedLink.url} className="w-full" />
        <ShareImageButton />
      </div>
    </div>
  );
};

export default ShareRoleTabs;
