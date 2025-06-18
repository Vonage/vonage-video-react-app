import { SessionStorage } from './sessionStorage';

class InMemorySessionStorage implements SessionStorage {
  sessions: { [key: string]: string } = {};
  async getSession(roomName: string): Promise<string | null> {
    return this.sessions[roomName] || null;
  }

  async setSession(roomName: string, sessionId: string): Promise<void> {
    this.sessions[roomName] = sessionId;
  }

  private captionsIds: { [key: string]: string } = {};
  private captionsUserCount: { [roomName: string]: number } = {};
  async setCaptionId(roomName: string, captionsId: string): Promise<void> {
    this.captionsIds[roomName] = captionsId;
  }

  async getCaptionsId(roomName: string): Promise<string | null> {
    return this.captionsIds[roomName] || null;
  }

  async addCaptionsUser(roomName: string): Promise<number> {
    this.captionsUserCount[roomName] = (this.captionsUserCount[roomName] || 0) + 1;
    return this.captionsUserCount[roomName];
  }

  async removeCaptionsUser(roomName: string): Promise<number> {
    this.captionsUserCount[roomName] = (this.captionsUserCount[roomName] || 0) - 1;
    if (this.captionsUserCount[roomName] < 0) {
      // Ensure count does not go negative mostly for unit testing purposes
      this.captionsUserCount[roomName] = 0;
    }
    return this.captionsUserCount[roomName];
  }
}
export default InMemorySessionStorage;
