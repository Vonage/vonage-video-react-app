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
    this.sessions[roomName] = {
      sessionId,
      captionsId: null,
      captionsUserCount: 0,
    };
  }

  async setCaptionsId(roomName: string, captionsId: string): Promise<void> {
    if (!this.sessions[roomName]) {
      throw new Error(`Session for room: ${roomName} does not exist. Cannot set captionsId.`);
    } else {
      this.sessions[roomName].captionsId = captionsId;
    }
  }

  async getCaptionsId(roomName: string): Promise<string | null> {
    return this.sessions[roomName]?.captionsId || null;
  }

  async addCaptionsUserCount(roomName: string): Promise<number> {
    if (!this.sessions[roomName]) {
      throw new Error(`Session for room: ${roomName} does not exist. Cannot add captions user.`);
    } else {
      this.sessions[roomName].captionsUserCount += 1;
    }
    return this.sessions[roomName].captionsUserCount;
  }

  async removeCaptionsUserCount(roomName: string): Promise<number> {
    if (!this.sessions[roomName]) {
      throw new Error(`Session for room: ${roomName} does not exist. Cannot remove captions user.`);
    }

    this.sessions[roomName].captionsUserCount -= 1;
    if (this.sessions[roomName].captionsUserCount < 0) {
      this.sessions[roomName].captionsUserCount = 0;
    }
    return this.sessions[roomName].captionsUserCount;
  }
}
export default InMemorySessionStorage;
