import { useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import classNames from 'classnames';
import VividIcon from '@components/VividIcon';
import AdvancedSettingsAudioTab from './AdvancedSettingsAudioTab';
import AdvancedSettingsGeneralTab from './AdvancedSettingsGeneralTab';
import AdvancedSettingsSidebar from './AdvancedSettingsSidebar';
import AdvancedSettingsStatisticsTab from './AdvancedSettingsStatisticsTab';
import AdvancedSettingsVideoTab from './AdvancedSettingsVideoTab';
import type {
  AdvancedSettingsAudioBitrate,
  AdvancedSettingsBitrateMode,
  AdvancedSettingsCodecMode,
  AdvancedSettingsDialogProps,
  AdvancedSettingsFrameRate,
  AdvancedSettingsManualCodecOrder,
  AdvancedSettingsResolution,
  AdvancedSettingsTab,
} from './AdvancedSettingsDialog.types';
import { ADVANCED_SETTINGS_CODEC_MODE } from './AdvancedSettingsDialog.types';

/**
 * AdvancedSettingsDialog Component
 * Renders the visual-only advanced settings dialog for the waiting room.
 */
const AdvancedSettingsDialog = ({
  isAdvancedSettingsOpen,
  setIsAdvancedSettingsOpen,
}: AdvancedSettingsDialogProps): ReactElement => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<AdvancedSettingsTab>('general');
  const [bitrateMode, setBitrateMode] = useState<AdvancedSettingsBitrateMode>('default');
  const [codecMode, setCodecMode] = useState<AdvancedSettingsCodecMode>(
    ADVANCED_SETTINGS_CODEC_MODE.automatic
  );
  const [codecPriority, setCodecPriority] = useState<AdvancedSettingsManualCodecOrder>([
    'vp9',
    'vp8',
    'h264',
  ]);
  const [frameRate, setFrameRate] = useState<AdvancedSettingsFrameRate>(30);
  const [resolution, setResolution] = useState<AdvancedSettingsResolution>('640x480');
  const [audioBitrate, setAudioBitrate] = useState<AdvancedSettingsAudioBitrate>(128);
  const [publisherAudioFallbackEnabled, setPublisherAudioFallbackEnabled] = useState(false);
  const [subscriberAudioFallbackEnabled, setSubscriberAudioFallbackEnabled] = useState(false);
  const [publisherStatisticsEnabled, setPublisherStatisticsEnabled] = useState(false);

  const handleClose = () => {
    setIsAdvancedSettingsOpen(false);
  };

  const tabContent = (() => {
    if (selectedTab === 'general') {
      return <AdvancedSettingsGeneralTab />;
    }

    if (selectedTab === 'video') {
      return (
        <AdvancedSettingsVideoTab
          bitrateMode={bitrateMode}
          setBitrateMode={setBitrateMode}
          codecMode={codecMode}
          setCodecMode={setCodecMode}
          codecPriority={codecPriority}
          setCodecPriority={setCodecPriority}
          frameRate={frameRate}
          setFrameRate={setFrameRate}
          resolution={resolution}
          setResolution={setResolution}
        />
      );
    }

    if (selectedTab === 'audio') {
      return (
        <AdvancedSettingsAudioTab
          audioBitrate={audioBitrate}
          setAudioBitrate={setAudioBitrate}
          publisherAudioFallbackEnabled={publisherAudioFallbackEnabled}
          setPublisherAudioFallbackEnabled={setPublisherAudioFallbackEnabled}
          subscriberAudioFallbackEnabled={subscriberAudioFallbackEnabled}
          setSubscriberAudioFallbackEnabled={setSubscriberAudioFallbackEnabled}
        />
      );
    }

    return (
      <AdvancedSettingsStatisticsTab
        publisherStatisticsEnabled={publisherStatisticsEnabled}
        setPublisherStatisticsEnabled={setPublisherStatisticsEnabled}
      />
    );
  })();

  return (
    <Dialog
      open={isAdvancedSettingsOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: 'h-[640px] max-h-[640px] overflow-hidden rounded-vera-large bg-vera-surface',
      }}
      data-testid="advanced-settings-dialog"
    >
      <div className="flex h-full flex-col bg-vera-surface">
        <div className="relative border-b border-vera-border bg-vera-surface px-6 pb-4 pt-6">
          <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
            {t('advancedSettings.title')}
          </h2>
          <button
            type="button"
            aria-label={t('button.close')}
            onClick={handleClose}
            className={classNames(
              'cursor-pointer absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full',
              'text-vera-secondary transition-colors hover:bg-vera-background'
            )}
          >
            <VividIcon name="close-line" customSize={-5} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <AdvancedSettingsSidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

          <div className="flex-1 overflow-y-auto p-6">{tabContent}</div>
        </div>
      </div>
    </Dialog>
  );
};

export default AdvancedSettingsDialog;
