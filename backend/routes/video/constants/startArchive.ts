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

// multiArchiveTag is a valid REST archive field but is not present on the SDK's ArchiveOptions
// type, so we extend it locally for a type-safe options object.
type ArchiveOptionsWithTag = ArchiveOptions & { multiArchiveTag?: string };

// A recording is a composed archive; resolution and layout are valid (and only valid) here.
const recordingOptions: ArchiveOptionsWithTag = {
  outputMode: ArchiveOutputMode.COMPOSED,
  multiArchiveTag: RECORDING_ARCHIVE_TAG,
  resolution: Resolution.FHD_LANDSCAPE,
  layout: {
    // In multiparty archives, we use the 'bestFit' layout to scale based on the number of streams. For screen-sharing archives,
    // we select 'horizontalPresentation' so the screenshare stream is displayed prominently along with other streams.
    // See: https://developer.vonage.com/en/video/guides/archive-broadcast-layout#layout-types-for-screen-sharing
    type: LayoutType.BEST_FIT,
    screenshareType: 'horizontalPresentation',
  },
};

// A post-call transcription is an individual-stream archive with audio + transcription. Vonage
// rejects `resolution` and `layout` for individual archives (400 Bad Request), so they are omitted.
// See: https://developer.vonage.com/en/video/guides/transcriptions
const transcriptionOptions: ArchiveOptionsWithTag = {
  outputMode: ArchiveOutputMode.INDIVIDUAL,
  multiArchiveTag: TRANSCRIPTION_ARCHIVE_TAG,
  hasAudio: true,
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
