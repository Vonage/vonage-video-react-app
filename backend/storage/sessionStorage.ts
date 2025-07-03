export interface SessionStorage {
  getSession(roomName: string): Promise<string | null>;
  setSession(roomName: string, sessionId: string): Promise<void>;
  setCaptionsId(roomName: string, captionsId: string): Promise<void>;
  getCaptionsId(roomName: string): Promise<string | null>;
  incrementCaptionsUserCount(roomName: string): Promise<number>;
  decrementCaptionsUserCount(roomName: string): Promise<number>;
}
