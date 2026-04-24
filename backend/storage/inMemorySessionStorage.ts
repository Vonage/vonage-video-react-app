/* eslint-disable @typescript-eslint/require-await */
import { SessionStorage } from './sessionStorage';

interface SessionData {
  sessionKey: string;
  captionsId: string | null;
  captionsUserCount: number;
}

class InMemorySessionStorage implements SessionStorage {
  private sessions: { [key: string]: SessionData } = {};
  private roomNameBySessionKey: { [sessionKey: string]: string } = {};

  async getSessionKey({ roomName }: { roomName: string }): Promise<string | null> {
    return this.sessions[roomName]?.sessionKey || null;
  }

  async setSession({
    roomName,
    sessionKey,
  }: {
    roomName: string;
    sessionKey: string;
  }): Promise<void> {
    this.sessions[roomName] = {
      sessionKey,
      captionsId: null,
      captionsUserCount: 0,
    };
    this.roomNameBySessionKey[sessionKey] = roomName;
  }

  private getSessionByKey(sessionKey: string): SessionData | undefined {
    const roomName = this.roomNameBySessionKey[sessionKey];
    if (!roomName) return undefined;
    return this.sessions[roomName];
  }

  async setCaptionsId({
    sessionKey,
    captionsId,
  }: {
    sessionKey: string;
    captionsId: string;
  }): Promise<void> {
    const session = this.getSessionByKey(sessionKey);
    if (!session) {
      throw new Error(`Session for key: ${sessionKey} does not exist. Cannot set captionsId.`);
    }
    session.captionsId = captionsId;
  }

  async getCaptionsId({ sessionKey }: { sessionKey: string }): Promise<string | null> {
    return this.getSessionByKey(sessionKey)?.captionsId || null;
  }

  async incrementCaptionsUserCount({ sessionKey }: { sessionKey: string }): Promise<number> {
    const session = this.getSessionByKey(sessionKey);
    if (!session) {
      throw new Error(`Session for key: ${sessionKey} does not exist. Cannot add captions user.`);
    }
    session.captionsUserCount += 1;

    return session.captionsUserCount;
  }

  async decrementCaptionsUserCount({ sessionKey }: { sessionKey: string }): Promise<number> {
    const session = this.getSessionByKey(sessionKey);
    if (!session) {
      throw new Error(
        `Session for key: ${sessionKey} does not exist. Cannot remove captions user.`
      );
    }

    if (session.captionsUserCount > 0) {
      session.captionsUserCount -= 1;
    }
    return session.captionsUserCount;
  }
}
export default InMemorySessionStorage;
