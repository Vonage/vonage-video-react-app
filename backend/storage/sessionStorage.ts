export interface SessionStorage {
  getSession(roomName: string): Promise<string | null>;
  setSession(roomName: string, sessionId: string): Promise<void>;
  setCaptionsId(roomName: string, captionsId: string): Promise<void>;
  getCaptionsId(roomName: string): Promise<string | null>;
  addCaptionsUserCount(roomName: string): Promise<number>;
  removeCaptionsUserCount(roomName: string): Promise<number>;
}
