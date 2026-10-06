import { HandlersConfig } from '@api-lib';
import { ArchiveOptions, ArchiveOutputMode, LayoutType, Resolution } from '@vonage/video';

/**
 * Vonage only allows more than one archive to run on a session at the same time when each archive
 * carries a distinct multiArchiveTag. A recording and a post-call transcription are two separate
 * archives, so we tag them by kind so they can coexist and be stopped independently.
 * See: https://developer.vonage.com/en/video/guides/archiving/overview#simultaneous-archives
 */
export const RECORDING_ARCHIVE_TAG = 'recording';
export const TRANSCRIPTION_ARCHIVE_TAG = 'transcription';

type ArchiveOptionsWithTag = ArchiveOptions & { multiArchiveTag?: string };

const recordingOptions: ArchiveOptionsWithTag = {
  name: RECORDING_ARCHIVE_TAG,
  outputMode: ArchiveOutputMode.COMPOSED,
  multiArchiveTag: RECORDING_ARCHIVE_TAG,
  resolution: Resolution.FHD_LANDSCAPE,
  layout: {
    type: LayoutType.BEST_FIT,
    screenshareType: 'horizontalPresentation',
  },
};

const transcriptionOptions: ArchiveOptionsWithTag = {
  name: TRANSCRIPTION_ARCHIVE_TAG,
  outputMode: ArchiveOutputMode.INDIVIDUAL,
  multiArchiveTag: TRANSCRIPTION_ARCHIVE_TAG,
  hasAudio: true,
  hasVideo: false,
  hasTranscription: true,
  transcriptionProperties: {
    hasSummary: true,
  },
};

const startArchive: HandlersConfig['startArchive'] = {
  addDefaults: ({ sessionKey, withTranscription, archiveOptions }) => ({
    sessionKey,
    archiveOptions: {
      ...(withTranscription ? transcriptionOptions : recordingOptions),
      ...archiveOptions,
    },
  }),
};

export default startArchive;
