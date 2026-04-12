export interface SessionStorage {
  getSessionKey(args: { roomName: string }): Promise<string | null>;
  setSession(args: { roomName: string; sessionKey: string }): Promise<void>;

  setCaptionsId(args: { sessionKey: string; captionsId: string }): Promise<void>;
  getCaptionsId(args: { sessionKey: string }): Promise<string | null>;
  incrementCaptionsUserCount(args: { sessionKey: string }): Promise<number>;
  decrementCaptionsUserCount(args: { sessionKey: string }): Promise<number>;
}
