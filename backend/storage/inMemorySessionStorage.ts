import { SessionStorage } from './sessionStorage';

interface SessionData {
  sessionId: string;
  captionsId: string | null;
  captionsUserCount: number;
}

class InMemorySessionStorage implements SessionStorage {
  private sessions: { [key: string]: SessionData } = {};

  async getSession(roomName: string): Promise<string | null> {
    return this.sessions[roomName]?.sessionId || null;
  }

  async setSession(roomName: string, sessionId: string): Promise<void> {
    if (!this.sessions[roomName]) {
      this.sessions[roomName] = {
        sessionId,
        captionsId: null,
        captionsUserCount: 0,
      };
    } else {
      this.sessions[roomName].sessionId = sessionId;
    }
  }

  async setCaptionsId(roomName: string, captionsId: string): Promise<void> {
    if (!this.sessions[roomName]) {
      this.sessions[roomName] = {
        sessionId: '',
        captionsId,
        captionsUserCount: 0,
      };
    } else {
      this.sessions[roomName].captionsId = captionsId;
    }
  }

  async getCaptionsId(roomName: string): Promise<string | null> {
    return this.sessions[roomName]?.captionsId || null;
  }

  async addCaptionsUser(roomName: string): Promise<number> {
    if (!this.sessions[roomName]) {
      this.sessions[roomName] = {
        sessionId: '',
        captionsId: null,
        captionsUserCount: 1,
      };
    } else {
      this.sessions[roomName].captionsUserCount += 1;
    }
    return this.sessions[roomName].captionsUserCount;
  }

  async removeCaptionsUser(roomName: string): Promise<number> {
    if (!this.sessions[roomName]) {
      return 0;
    }

    this.sessions[roomName].captionsUserCount -= 1;
    if (this.sessions[roomName].captionsUserCount < 0) {
      // Ensure count does not go negative mostly for unit testing purposes
      this.sessions[roomName].captionsUserCount = 0;
    }
    return this.sessions[roomName].captionsUserCount;
  }
}
export default InMemorySessionStorage;
