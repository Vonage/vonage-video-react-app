/* eslint-disable @typescript-eslint/require-await */
import { SessionStorage } from '../sessionStorage';

interface SessionData {
  sessionKey: string;
  captionsId: string | null;
  captionsUserCount: number;
  archiveIds: string[];
  serverRotationPending: number;
  transcriptionWithSummary: boolean;
}

class InMemorySessionStorage implements SessionStorage {
  private sessions: { [sessionId: string]: SessionData } = {};
  private sessionIdBySessionKey: { [sessionKey: string]: string } = {};
  private sessionKeyByRoomName: { [roomName: string]: string } = {};

  async getSessionKeyByRoomName({ roomName }: { roomName: string }): Promise<string | null> {
    return this.sessionKeyByRoomName[roomName] ?? null;
  }

  async getSessionKeyBySessionId({ sessionId }: { sessionId: string }): Promise<string | null> {
    return this.sessions[sessionId]?.sessionKey ?? null;
  }

  async setSession({
    roomName,
    sessionKey,
    sessionId,
  }: {
    roomName?: string;
    sessionKey: string;
    sessionId: string;
  }): Promise<void> {
    const existingSession = this.sessions[sessionId];
    this.sessions[sessionId] = existingSession
      ? { ...existingSession, sessionKey }
      : {
          sessionKey,
          captionsId: null,
          captionsUserCount: 0,
          archiveIds: [],
          serverRotationPending: 0,
          transcriptionWithSummary: true,
        };
    this.sessionIdBySessionKey[sessionKey] = sessionId;
    if (roomName) {
      this.sessionKeyByRoomName[roomName] = sessionKey;
    }
  }

  private getSessionByKey(sessionKey: string): SessionData | undefined {
    const sessionId = this.sessionIdBySessionKey[sessionKey];
    if (!sessionId) return undefined;
    return this.sessions[sessionId];
  }

  private getSessionBySessionId(sessionId: string): SessionData | undefined {
    return this.sessions[sessionId];
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

  async setServerRotationPending({
    sessionId,
    pending,
  }: {
    sessionId: string;
    pending: number;
  }): Promise<void> {
    const session = this.getSessionBySessionId(sessionId);
    if (!session) return;
    session.serverRotationPending = pending;
  }

  async getServerRotationPending({ sessionId }: { sessionId: string }): Promise<number> {
    return this.getSessionBySessionId(sessionId)?.serverRotationPending ?? 0;
  }

  async setTranscriptionWithSummary({
    sessionId,
    withSummary,
  }: {
    sessionId: string;
    withSummary: boolean;
  }): Promise<void> {
    const session = this.getSessionBySessionId(sessionId);
    if (!session) return;
    session.transcriptionWithSummary = withSummary;
  }

  async getTranscriptionWithSummary({ sessionId }: { sessionId: string }): Promise<boolean> {
    return this.getSessionBySessionId(sessionId)?.transcriptionWithSummary ?? true;
  }
}

export default InMemorySessionStorage;
