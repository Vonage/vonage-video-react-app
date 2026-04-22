import { Archive, ServerArchive } from '../model';

export const startedServerArchive: ServerArchive = {
  id: 'dc91ede6-0d1a-4de6-90d8-692c2113b34a',
  status: 'started',
  name: '',
  reason: '',
  sessionId: '2_MX40Njk2OTE2NH5-MTcyNTI2ODA5Mjc2OH5FMk8vWlE1Wkp6alVNR2xoQ1VveTZzNk1-fn4',
  applicationId: '46969164',
  createdAt: 1725268594000,
  size: 0,
  duration: 0,
  outputMode: 'composed',
  streamMode: 'auto',
  hasAudio: true,
  hasVideo: true,
  hasTranscription: false,
  sha256sum: '',
  password: '',
  updatedAt: 1725268594000,
  multiArchiveTag: '',
  event: 'archive',
  partnerId: 46969164,
  projectId: 46969164,
  resolution: '640x480',
  url: null,
};

export const pendingArchive: Archive = {
  createdAt: 1725268594000,
  createdAtFormatted: 'Mon, Sep 2 5:16 AM',
  id: 'dc91ede6-0d1a-4de6-90d8-692c2113b34a',
  status: 'pending',
  url: null,
};

export const availableServerArchive: ServerArchive = {
  id: 'c32509e3-24a9-4d1f-98a0-66a0f0fdbca6',
  status: 'available',
  name: '',
  reason: 'user initiated',
  sessionId: '2_MX40Njk2OTE2NH5-MTcyNTI2ODA5Mjc2OH5FMk8vWlE1Wkp6alVNR2xoQ1VveTZzNk1-fn4',
  applicationId: '46969164',
  createdAt: 1725268141000,
  size: 278545,
  duration: 56,
  outputMode: 'composed',
  streamMode: 'auto',
  hasAudio: true,
  hasVideo: true,
  hasTranscription: false,
  sha256sum: 'fEzap6vpxmzvZj4l+aZ4PNDK1MOz9gxZ4eRmUpsPECk=',
  password: '',
  updatedAt: 1725268199000,
  multiArchiveTag: '',
  event: 'archive',
  partnerId: 46969164,
  projectId: 46969164,
  resolution: '640x480',
  url: 'https://example.com.com/tokbox.com.archive2.eu/46969164/c32509e3-24a9-4d1f-98a0-66a0f0fdbca6/archive.mp4',
};
export const availableArchive: Archive = {
  createdAt: 1725268141000,
  createdAtFormatted: 'Mon, Sep 2 5:09 AM',
  id: 'c32509e3-24a9-4d1f-98a0-66a0f0fdbca6',
  status: 'available',
  url: 'https://example.com.com/tokbox.com.archive2.eu/46969164/c32509e3-24a9-4d1f-98a0-66a0f0fdbca6/archive.mp4',
};

export const failedServerArchive: ServerArchive = {
  id: '88417e46-6459-435b-b1a4-8524db79946c',
  status: 'failed',
  name: '',
  reason: 'user initiated',
  sessionId: '2_MX40Njk2OTE2NH5-MTcyNTI2ODA5Mjc2OH5FMk8vWlE1Wkp6alVNR2xoQ1VveTZzNk1-fn4',
  applicationId: '46969164',
  createdAt: 1725268111000,
  size: 911104,
  duration: 13,
  outputMode: 'composed',
  streamMode: 'auto',
  hasAudio: true,
  hasVideo: true,
  hasTranscription: false,
  sha256sum: 'W6t88jhGPfucqChZOAdM47U8wiY8eubDBS2BdqsfUeM=',
  password: '',
  updatedAt: 1725268127000,
  multiArchiveTag: '',
  event: 'archive',
  partnerId: 46969164,
  projectId: 46969164,
  resolution: '640x480',
  url: null,
};

export const failedArchive: Archive = {
  createdAt: 1725268111000,
  createdAtFormatted: 'Mon, Sep 2 5:08 AM',
  id: '88417e46-6459-435b-b1a4-8524db79946c',
  status: 'failed',
  url: null,
};

export const archives: Archive[] = [pendingArchive, availableArchive, failedArchive];

export const serverArchives: ServerArchive[] = [
  startedServerArchive,
  availableServerArchive,
  failedServerArchive,
];
