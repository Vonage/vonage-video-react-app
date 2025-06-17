export interface SessionStorage {
  getSession(roomName: string): Promise<string | null>;
  setSession(roomName: string, sessionId: string): Promise<void>;
  setCaptionId(roomName: string, captionId: string): Promise<void>;
  getCaptionId(roomName: string): Promise<string | null>;
  addCaptionsUser(roomName: string): Promise<number>;
  removeCaptionsUser(roomName: string): Promise<number>;
}
