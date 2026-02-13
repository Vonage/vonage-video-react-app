/* eslint-disable @typescript-eslint/require-await */
import { SessionStorage } from './sessionStorage';

interface SessionData {
  sessionId: string;
  captionsUserCount: number;
}

class InMemorySessionStorage implements SessionStorage {
  private sessions: { [key: string]: SessionData } = {};

  async getSession(roomName: string): Promise<string | null> {
    return this.sessions[roomName]?.sessionId || null;
  }

  async setSession(roomName: string, sessionId: string): Promise<void> {
    this.sessions[roomName] = {
      sessionId,
      captionsUserCount: 0,
    };
  }
}
export default InMemorySessionStorage;
