export interface SessionStorage {
  getSession(roomName: string): Promise<string | null>;
  setSession(roomName: string, sessionId: string): Promise<void>;
}
