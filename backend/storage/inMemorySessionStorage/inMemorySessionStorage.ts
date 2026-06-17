/* eslint-disable @typescript-eslint/require-await */
import { SessionStorage } from '../sessionStorage';

interface SessionData {
  sessionKey: string;
  captionsId: string | null;
  captionsUserCount: number;
  archiveIds: string[];
}

class InMemorySessionStorage implements SessionStorage {
  private sessions: { [key: string]: SessionData } = {};
  private roomNameBySessionKey: { [sessionKey: string]: string } = {};
  private sessionKeyBySessionId: { [sessionId: string]: string } = {};

  async getSessionKeyByRoomName({ roomName }: { roomName: string }): Promise<string | null> {
    return this.sessions[roomName]?.sessionKey || null;
  }

  async setSession({
    roomName,
    sessionKey,
    sessionId,
  }: {
    roomName: string;
    sessionKey: string;
    sessionId: string;
  }): Promise<void> {
    this.sessions[roomName] = {
      sessionKey,
      captionsId: null,
      captionsUserCount: 0,
      archiveIds: [],
    };
    this.roomNameBySessionKey[sessionKey] = roomName;
    if (sessionId) {
      this.sessionKeyBySessionId[sessionId] = sessionKey;
    }
  }

  private getSessionByKey(sessionKey: string): SessionData | undefined {
    const roomName = this.roomNameBySessionKey[sessionKey];
    if (!roomName) return undefined;
    return this.sessions[roomName];
  }

  private getSessionBySessionId(sessionId: string): SessionData | undefined {
    const sessionKey = this.sessionKeyBySessionId[sessionId];
    if (!sessionKey) return undefined;
    return this.getSessionByKey(sessionKey);
  }

  async setCaptionsId({
    sessionId,
    captionsId,
  }: {
    sessionId: string;
    captionsId: string | null;
  }): Promise<void> {
    const session = this.getSessionBySessionId(sessionId);
    if (!session) {
      throw new Error(`Session for id: ${sessionId} does not exist. Cannot set captionsId.`);
    }
    session.captionsId = captionsId;
  }

  async getCaptionsId({ sessionId }: { sessionId: string }): Promise<string | null> {
    return this.getSessionBySessionId(sessionId)?.captionsId || null;
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

  async setArchiveIds({
    sessionId,
    archiveIds,
  }: {
    sessionId: string;
    archiveIds: string[];
  }): Promise<void> {
    const session = this.getSessionBySessionId(sessionId);
    if (!session) {
      throw new Error(`Session for id: ${sessionId} does not exist. Cannot set archiveIds.`);
    }
    session.archiveIds = archiveIds;
  }

  async getArchiveIds({ sessionId }: { sessionId: string }): Promise<string[]> {
    return this.getSessionBySessionId(sessionId)?.archiveIds ?? [];
  }
}
export default InMemorySessionStorage;
