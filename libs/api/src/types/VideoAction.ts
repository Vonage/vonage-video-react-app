/**
 * Public api actions to export through the video router.
 */
export enum VideoAction {
  createEphemeralToken = 'createEphemeralToken',
  createSession = 'createSession',
  createSessionAndJoin = 'createSessionAndJoin',
  startArchive = 'startArchive',
  stopArchive = 'stopArchive',
  searchArchives = 'searchArchives',
  enableCaptions = 'enableCaptions',
  disableCaptions = 'disableCaptions',
  joinSession = 'joinSession',
  ensureCaptionsEnabled = 'ensureCaptionsEnabled',
}

export default VideoAction;
