export interface SessionStorage {
  getSessionKeyByRoomName(args: { roomName: string }): Promise<string | null>;
  setSession(args: { roomName: string; sessionKey: string; sessionId: string }): Promise<void>;

  setCaptionsId(args: { sessionId: string; captionsId: string | null }): Promise<void>;
  getCaptionsId(args: { sessionId: string }): Promise<string | null>;

  incrementCaptionsUserCount(args: { sessionKey: string }): Promise<number>;
  decrementCaptionsUserCount(args: { sessionKey: string }): Promise<number>;

  setArchiveIds(args: { sessionId: string; archiveIds: string[] }): Promise<void>;
  getArchiveIds(args: { sessionId: string }): Promise<string[]>;

  setAuthTransaction(args: {
    transactionId: string;
    state: string;
    codeVerifier: string;
    returnTo: string;
  }): Promise<void>;
  getAuthTransaction(args: {
    transactionId: string;
  }): Promise<{ state: string; codeVerifier: string; returnTo: string } | null>;
  deleteAuthTransaction(args: { transactionId: string }): Promise<void>;

  setAccessToken(args: { sessionId: string; accessToken: string }): Promise<void>;
  getAccessToken(args: { sessionId: string }): Promise<string | null>;
}
