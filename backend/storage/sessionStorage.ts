export interface SessionStorage {
  getSessionKeyByRoomName(args: { roomName: string }): Promise<string | null>;
  setSession(args: { roomName: string; sessionKey: string; sessionId: string }): Promise<void>;

  setCaptionsId(args: { sessionId: string; captionsId: string | null }): Promise<void>;
  getCaptionsId(args: { sessionId: string }): Promise<string | null>;

  incrementCaptionsUserCount(args: { sessionKey: string }): Promise<number>;
  decrementCaptionsUserCount(args: { sessionKey: string }): Promise<number>;

  setArchiveIds(args: { sessionId: string; archiveIds: string[] }): Promise<void>;
  getArchiveIds(args: { sessionId: string }): Promise<string[]>;
}
