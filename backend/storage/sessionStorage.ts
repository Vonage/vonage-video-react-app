export interface SessionStorage {
  getSession(roomName: string): Promise<string | null>;
  setSession(roomName: string, sessionId: string): Promise<void>;
  setCaptionId(roomName: string, captionsId: string): Promise<void>;
  getCaptionsId(roomName: string): Promise<string | null>;
  addCaptionsUser(roomName: string): Promise<number>;
  removeCaptionsUser(roomName: string): Promise<number>;
}
