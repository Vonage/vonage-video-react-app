export enum VideoAction {
  createEphemeralToken = 'createEphemeralToken',
  createSession = 'createSession',
  decodeSessionId = 'decodeSessionId',
  startArchive = 'startArchive',
  stopArchive = 'stopArchive',
  searchArchives = 'searchArchives',
  enableCaptions = 'enableCaptions',
  disableCaptions = 'disableCaptions',
  joinSession = 'joinSession',
}

export default VideoAction;
