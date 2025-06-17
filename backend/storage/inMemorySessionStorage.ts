import { SessionStorage } from './sessionStorage';

class InMemorySessionStorage implements SessionStorage {
  sessions: { [key: string]: string } = {};
  async getSession(roomName: string): Promise<string | null> {
    return this.sessions[roomName] || null;
  }

  async setSession(roomName: string, sessionId: string): Promise<void> {
    this.sessions[roomName] = sessionId;
  }

  private captionIds: { [key: string]: string } = {};
  private captionsUserCount: { [roomName: string]: number } = {};
  async setCaptionId(roomName: string, captionId: string): Promise<void> {
    this.captionIds[roomName] = captionId;
  }

  async getCaptionId(roomName: string): Promise<string | null> {
    return this.captionIds[roomName] || null;
  }

  async addCaptionsUser(roomName: string): Promise<number> {
    this.captionsUserCount[roomName] = (this.captionsUserCount[roomName] || 0) + 1;
    return this.captionsUserCount[roomName];
  }

  async removeCaptionsUser(roomName: string): Promise<number> {
    if (!this.captionsUserCount[roomName]) {
      return 0;
    }
    this.captionsUserCount[roomName] = Math.max(0, this.captionsUserCount[roomName] - 1);
    return this.captionsUserCount[roomName];
  }

  async getCaptionsUserCount(roomName: string): Promise<number> {
    return this.captionsUserCount[roomName] || 0;
  }
}
export default InMemorySessionStorage;
