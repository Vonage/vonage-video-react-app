import type { SingleArchiveResponse, SingleArchiveResponseBase } from '@vonage/video';
import uniqueId from 'react-global-state-hooks/uniqueId';

type ArchiveVariant =
  | 'available'
  | 'pending'
  | 'started'
  | 'stopped'
  | 'uploaded'
  | 'paused'
  | 'failed'
  | 'withTranscription'
  | 'withMaxBitrate'
  | 'withQuantizationParameter';

const base: SingleArchiveResponseBase = {
  id: 'c32509e3-24a9-4d1f-98a0-66a0f0fdbca6',
  status: 'available',
  name: 'Ready archive example',
  reason: 'user initiated',
  sessionId: '2_MX40Njk2OTE2NH5-MTcyNTI2ODA5Mjc2OH5FMk8vWlE1Wkp6alVNR2xoQ1VveTZzNk1-fn4',
  projectId: '46969164',
  createdAt: 1725268141000,
  size: 278545,
  duration: 56,
  outputMode: 'composed',
  streamMode: 'auto',
  hasAudio: true,
  hasVideo: true,
  resolution: '640x480',
  url: 'https://example.com/tokbox.com.archive2.eu/46969164/c32509e3-24a9-4d1f-98a0-66a0f0fdbca6/archive.mp4',
  streams: ['stream-1', 'stream-2'],
};

const pendingArchiveFields = {
  url: undefined,
  size: 0,
  duration: 0,
  reason: '',
} satisfies Partial<SingleArchiveResponse>;

const variants = {
  available: {
    status: 'available',
    url: base.url,
    size: 278545,
    duration: 56,
    reason: 'user initiated',
  },

  // Convenience alias for the UI pending state.
  // The server does not return "pending"; ArchiveList maps "started" to "pending".
  pending: {
    ...pendingArchiveFields,
    status: 'started',
  },

  started: {
    ...pendingArchiveFields,
    status: 'started',
  },

  stopped: {
    ...pendingArchiveFields,
    status: 'stopped',
  },

  uploaded: {
    ...pendingArchiveFields,
    status: 'uploaded',
  },

  paused: {
    ...pendingArchiveFields,
    status: 'paused',
  },

  failed: {
    status: 'failed',
    url: undefined,
    size: 0,
    duration: 0,
    reason: 'Archive failed',
  },

  withTranscription: {
    hasTranscription: true,
    transcriptionProperties: {
      primaryLanguageCode: 'en-US',
      hasSummary: true,
    },
  },

  withMaxBitrate: {
    maxBitrate: 2500000,
  },

  withQuantizationParameter: {
    quantizationParameter: 23,
  },
} satisfies Record<ArchiveVariant, Partial<SingleArchiveResponse>>;

const makeArchive = (
  type: ArchiveVariant,
  overrides: Partial<SingleArchiveResponse> = {}
): SingleArchiveResponse => {
  return {
    ...base,
    id: uniqueId(),
    hasTranscription: false,
    maxBitrate: 2500000,
    ...variants[type],
    ...overrides,
  } as SingleArchiveResponse;
};

export default makeArchive;
