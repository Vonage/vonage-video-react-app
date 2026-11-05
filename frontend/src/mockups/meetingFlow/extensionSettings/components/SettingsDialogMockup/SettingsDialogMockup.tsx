import type { PropsWithChildren, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import DialogFrame from '../../../components/DialogFrame';
import SettingsDialogMockupSidebar from './components/SettingsDialogMockupSidebar';

/**
 * The Settings dialog opened on the new Meeting tab; the children are the tab content.
 */
const SettingsDialogMockup = ({ children }: PropsWithChildren): ReactElement => {
  const { t } = useTranslation();

  return (
    <DialogFrame title={t('advancedSettings.title')} size="tall">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <SettingsDialogMockupSidebar />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </DialogFrame>
  );
};

export default SettingsDialogMockup;
