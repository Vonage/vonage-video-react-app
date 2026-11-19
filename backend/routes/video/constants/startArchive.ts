import { HandlersConfig } from '@api-lib';
import { ArchiveOptions, ArchiveOutputMode, LayoutType, Resolution } from '@vonage/video';
import { RECORDING_ARCHIVE_NAME, TRANSCRIPTION_ARCHIVE_NAME } from '@common/constants';

type ArchiveOptionsWithTag = ArchiveOptions & { multiArchiveTag?: string };

const recordingOptions: ArchiveOptionsWithTag = {
  name: RECORDING_ARCHIVE_NAME,
  outputMode: ArchiveOutputMode.COMPOSED,
  multiArchiveTag: RECORDING_ARCHIVE_NAME,
  resolution: Resolution.FHD_LANDSCAPE,
  layout: {
    type: LayoutType.BEST_FIT,
    screenshareType: 'horizontalPresentation',
  },
};

const transcriptionOptions: ArchiveOptionsWithTag = {
  name: TRANSCRIPTION_ARCHIVE_NAME,
  outputMode: ArchiveOutputMode.INDIVIDUAL,
  multiArchiveTag: TRANSCRIPTION_ARCHIVE_NAME,
  hasAudio: true,
  hasVideo: false,
  hasTranscription: true,
  transcriptionProperties: {
    hasSummary: true,
  },
};

const startArchive: HandlersConfig['startArchive'] = {
  addDefaults: ({ sessionKey, withTranscription, withSummary, archiveOptions }) => {
    const baseOptions = (() => {
      if (!withTranscription) return recordingOptions;
      if (withSummary === false) {
        return {
          ...transcriptionOptions,
          transcriptionProperties: {
            ...transcriptionOptions.transcriptionProperties,
            hasSummary: false,
          },
        };
      }
      return transcriptionOptions;
    })();

    return {
      sessionKey,
      archiveOptions: {
        ...baseOptions,
        ...archiveOptions,
      },
    };
  },
};

export default startArchive;
